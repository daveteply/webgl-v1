import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Color, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from 'three';

import { InteractionManagerService } from './interaction-manager.service';
import { ObjectManagerService } from './object-manager.service';
import { PostProcessingManagerService } from './post-processing-manager.service';
import { ShareManagerService } from 'src/app/game/services/share-manager.service';

import * as TWEEN from '@tweenjs/tween.js';

@Injectable({
  providedIn: 'root',
})
export class SceneManagerService implements OnDestroy {
  private _previousFrameRenderTime!: number;

  private _renderer!: WebGLRenderer;
  private _scene!: Scene;
  private _camera!: PerspectiveCamera;

  private _pointLight!: PointLight;

  private _animateRequestId!: number;

  constructor(
    private ngZone: NgZone,
    private objectManager: ObjectManagerService,
    private interactionManager: InteractionManagerService,
    private postProcessingManager: PostProcessingManagerService,
    private shareManager: ShareManagerService
  ) {
    this._scene = new Scene();
    this._scene.background = new Color(0xf0f0f0f);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this._animateRequestId);
  }

  public InitScene(canvas: HTMLCanvasElement): void {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // camera
    this._camera = new PerspectiveCamera(45, width / height, 1, 50);
    this._camera.position.z = 5;
    // connect object manager
    this.objectManager.SetCamera(this._camera);
    this.objectManager.SetScene(this._scene);
    // connect interaction manager
    this.interactionManager.SetCamera(this._camera);
    this.interactionManager.InitInteractions(canvas);

    // light
    this._pointLight = new PointLight();
    this._pointLight.position.z = 5;
    this._scene.add(this._pointLight);

    // renderer
    this._renderer = new WebGLRenderer({ canvas, stencil: false, depth: false });
    this._renderer.autoClear = false;
    this._renderer.setSize(width, height, false);

    // post processing
    this.postProcessingManager.InitPostProcessing(this._scene, this._camera, this._renderer, width, height);

    // DEBUG
    // setInterval(() => {
    //   console.log(this._renderer?.info);
    // }, 5000);

    // start rendering frames
    this.animate(1);
  }

  public UpdateSize(pixelRatio: number): void {
    const canvas = this._renderer.domElement;
    const width = (canvas.clientWidth * pixelRatio) | 0;
    const height = (canvas.clientHeight * pixelRatio) | 0;
    if (canvas.width !== width || canvas.height !== height) {
      // camera
      this._camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this._camera.updateProjectionMatrix();

      // renderer
      this._renderer.setSize(width, height, false);

      // composer
      this.postProcessingManager.Composer.setSize(width, height);

      // smaa
      this.postProcessingManager.SMAAPass.setSize(width, height);
    }

    this.interactionManager.CanvasRect = canvas.getBoundingClientRect();
  }

  private animate(now: number): void {
    now *= 0.001; // convert to seconds
    const deltaTime = now - this._previousFrameRenderTime;
    this._previousFrameRenderTime = now;

    this.ngZone.runOutsideAngular(() => {
      TWEEN.update();
      this.objectManager.UpdateStarField();
      this.postProcessingManager.Composer.render(deltaTime);

      if (this.shareManager.ScreenShotRequested) {
        this.shareManager.UpdateScreenShotData(this._renderer.domElement.toDataURL());
      }
    });

    requestAnimationFrame((now) => {
      this.animate(now);
    });
  }
}
