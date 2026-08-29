import { Injectable, OnDestroy, inject } from '@angular/core';
import { Color, MathUtils, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from 'three';

import { InteractionManagerService } from './interaction-manager';
import { ObjectManagerService } from './object-manager';
import { PostProcessingManagerService } from './post-processing-manager';
import { ShareManagerService } from './share-manager';

import { mainTweenGroup } from './tween-group';

@Injectable({
  providedIn: 'root',
})
export class SceneManagerService implements OnDestroy {
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
    this.updateCameraProjection(width, height);
    this._camera.position.z = 5;
    this._scene.add(this._camera);
    // connect object manager
    this.objectManager.SetCamera(this._camera);
    this.objectManager.SetLight(this._pointLight);
    this.objectManager.SetScene(this._scene);
    // connect interaction manager
    this.interactionManager.SetCamera(this._camera);
    this.interactionManager.InitInteractions(canvas);

    // renderer
    try {
      this._renderer = new WebGLRenderer({ canvas, stencil: false, depth: false });
      this._renderer.autoClear = false;
      this._renderer.setSize(width, height, false);
      this._renderer.toneMappingExposure = 1.0;

      // post processing
      this.postProcessingManager.InitPostProcessing(this._scene, this._camera, this._renderer, width, height);

      // start rendering frames
      const initialNow = performance.now();
      this._previousFrameRenderTime = initialNow * 0.001;
      this.animate(initialNow);
    } catch {
      // Handle WebGL unavailable in headless environments gracefully
    }
  }

  public UpdateSize(pixelRatio: number): void {
    const canvas = this._renderer?.domElement;
    if (!canvas) return;

    const rawWidth = canvas.clientWidth || window.innerWidth || 300;
    const rawHeight = canvas.clientHeight || window.innerHeight || 150;

    const width = (rawWidth * pixelRatio) | 0;
    const height = (rawHeight * pixelRatio) | 0;
    if (width > 0 && height > 0) {
      // camera projection update
      this.updateCameraProjection(rawWidth, rawHeight);

      if (canvas.width !== width || canvas.height !== height) {
        // renderer
        this._renderer.setSize(width, height, false);

        // composer
        this.postProcessingManager.Composer?.setSize(width, height);

        // smaa
        this.postProcessingManager.SMAAPass?.setSize(width, height);
      }
    }

    this.interactionManager.CanvasRect = canvas.getBoundingClientRect();
  }

  private updateCameraProjection(rawWidth: number, rawHeight: number): void {
    if (!this._camera) return;
    const aspect = rawWidth / rawHeight;
    const targetAspect = 0.75;
    if (aspect < targetAspect) {
      // Calculate vertical FOV to maintain constant horizontal field of view across devices
      const hFovRad = 2 * Math.atan(Math.tan(MathUtils.degToRad(45 / 2)) * targetAspect);
      const vFovRad = 2 * Math.atan(Math.tan(hFovRad / 2) / aspect);
      this._camera.fov = MathUtils.radToDeg(vFovRad);
    } else {
      this._camera.fov = 45;
    }
    this._camera.aspect = aspect;
    this._camera.updateProjectionMatrix();
  }

  private animate(now: number): void {
    mainTweenGroup.update(now);

    const nowSec = now * 0.001;
    const deltaTime = nowSec - this._previousFrameRenderTime;
    this._previousFrameRenderTime = nowSec;

    this.objectManager.UpdateStarField();
    this.postProcessingManager.Composer.render(deltaTime);

    if (this.shareManager.ScreenShotRequested && this._renderer?.domElement) {
      this.shareManager.UpdateScreenShotData(this._renderer.domElement.toDataURL());
    }

    this._animateRequestId = requestAnimationFrame((now) => {
      this.animate(now);
    });
  }
}
