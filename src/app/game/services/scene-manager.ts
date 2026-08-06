import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { AmbientLight, Color, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from 'three';

import { InteractionManagerService } from './interaction-manager';
import { ObjectManagerService } from './object-manager';
import { PostProcessingManagerService } from './post-processing-manager';
import { ShareManagerService } from './share-manager';

import * as TWEEN from '@tweenjs/tween.js';

@Injectable({
  providedIn: 'root',
})
export class SceneManagerService implements OnDestroy {
  private ngZone = inject(NgZone);
  private objectManager = inject(ObjectManagerService);
  private interactionManager = inject(InteractionManagerService);
  private postProcessingManager = inject(PostProcessingManagerService);
  private shareManager = inject(ShareManagerService);

  private _previousFrameRenderTime!: number;

  private _renderer!: WebGLRenderer;
  private _scene!: Scene;
  private _camera!: PerspectiveCamera;

  private _pointLight!: PointLight;

  private _animateRequestId!: number;

  constructor() {
    this._scene = new Scene();
    this._scene.background = new Color(0x0f0f0f);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this._animateRequestId);
  }

  public InitScene(canvas: HTMLCanvasElement): void {
    const width = canvas.clientWidth || window.innerWidth || 300;
    const height = canvas.clientHeight || window.innerHeight || 150;

    this._pointLight = new PointLight(0xffffff, 350);
    this._pointLight.position.z = 5;
    this._scene.add(this._pointLight);

    // camera
    this._camera = new PerspectiveCamera(45, width / height, 1, 50);
    this._camera.position.z = 5;
    // connect object manager
    this.objectManager.SetCamera(this._camera);
    this.objectManager.SetLight(this._pointLight);
    this.objectManager.SetScene(this._scene);
    // connect interaction manager
    this.interactionManager.SetCamera(this._camera);
    this.interactionManager.InitInteractions(canvas);

    // renderer
    this._renderer = new WebGLRenderer({ canvas, stencil: false, depth: false });
    this._renderer.autoClear = false;
    this._renderer.setSize(width, height, false);

    // post processing
    this.postProcessingManager.InitPostProcessing(this._scene, this._camera, this._renderer, width, height);

    // start rendering frames
    const initialNow = performance.now();
    this._previousFrameRenderTime = initialNow * 0.001;
    this.animate(initialNow);
  }

  public UpdateSize(pixelRatio: number): void {
    const canvas = this._renderer?.domElement;
    if (!canvas) return;

    const rawWidth = canvas.clientWidth || window.innerWidth || 300;
    const rawHeight = canvas.clientHeight || window.innerHeight || 150;

    const width = (rawWidth * pixelRatio) | 0;
    const height = (rawHeight * pixelRatio) | 0;
    if (width > 0 && height > 0 && (canvas.width !== width || canvas.height !== height)) {
      // camera
      this._camera.aspect = rawWidth / rawHeight;
      this._camera.updateProjectionMatrix();

      // renderer
      this._renderer.setSize(width, height, false);

      // composer
      this.postProcessingManager.Composer?.setSize(width, height);

      // smaa
      this.postProcessingManager.SMAAPass?.setSize(width, height);
    }

    this.interactionManager.CanvasRect = canvas.getBoundingClientRect();
  }

  private animate(now: number): void {
    this.ngZone.runOutsideAngular(() => {
      TWEEN.update(now);

      const nowSec = now * 0.001;
      const deltaTime = nowSec - this._previousFrameRenderTime;
      this._previousFrameRenderTime = nowSec;

      this.objectManager.UpdateStarField();
      this.postProcessingManager.Composer.render(deltaTime);

      if (this.shareManager.ScreenShotRequested && this._renderer?.domElement) {
        this.shareManager.UpdateScreenShotData(this._renderer.domElement.toDataURL());
      }
    });

    this._animateRequestId = requestAnimationFrame((now) => {
      this.animate(now);
    });
  }
}
