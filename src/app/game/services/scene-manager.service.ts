import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Color, PerspectiveCamera, PointLight, Scene, Vector2, WebGLRenderer } from 'three';
import { InteractionManagerService } from './interaction-manager.service';
import { ObjectManagerService } from './object-manager.service';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';

import * as TWEEN from '@tweenjs/tween.js';

@Injectable()
export class SceneManagerService implements OnDestroy {
  private _previousFrameRenderTime!: number;

  private _renderer!: WebGLRenderer;
  private _scene!: Scene;
  private _camera!: PerspectiveCamera;

  private _composer!: EffectComposer;
  private _renderPass!: RenderPass;
  private _outlinePass!: OutlinePass;
  private _smaaPass!: SMAAPass;

  private _pointLight!: PointLight;

  private _animateRequestId!: number;

  private _slightGrey!: Color;

  constructor(
    private ngZone: NgZone,
    private objectManager: ObjectManagerService,
    private interactionManager: InteractionManagerService
  ) {
    this._slightGrey = new Color(0xf0f0f0f);

    this._scene = new Scene();
    this._scene.background = this._slightGrey;
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
    this._renderer = new WebGLRenderer({ canvas });
    this._renderer.autoClear = false;
    this._renderer.setSize(width, height, false);

    // render pass
    this._renderPass = new RenderPass(this._scene, this._camera);
    this._renderPass.clearColor = this._slightGrey;
    this._renderPass.clearAlpha = 0;

    // outline pass
    this._outlinePass = new OutlinePass(new Vector2(width, height), this._scene, this._camera);
    this._outlinePass.edgeGlow = 1;
    this._outlinePass.edgeThickness = 10;
    this._outlinePass.edgeStrength = 10;
    this._outlinePass.renderToScreen = true;
    this.objectManager.SetOutlinePass(this._outlinePass);

    // smaa
    this._smaaPass = new SMAAPass(width, height);

    // composer
    this._composer = new EffectComposer(this._renderer);
    this._composer.addPass(this._renderPass);
    this._composer.addPass(this._outlinePass);
    this._composer.addPass(this._smaaPass);

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
      this._composer.setSize(width, height);

      // smaa
      this._smaaPass.setSize(width, height);
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
      this._composer.render(deltaTime);
    });

    requestAnimationFrame((now) => {
      this.animate(now);
    });
  }
}
