import { Injectable, NgZone } from '@angular/core';
import { Color, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from 'three';
import { InteractionManagerService } from './interaction-manager.service';
import { ObjectManagerService } from './object-manager.service';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as TWEEN from '@tweenjs/tween.js';

@Injectable()
export class SceneManagerService {
  private _renderer!: WebGLRenderer;
  private _scene!: Scene;
  private _camera!: PerspectiveCamera;

  private _pointLight!: PointLight;

  constructor(
    private ngZone: NgZone,
    private objectManager: ObjectManagerService,
    private interactionManager: InteractionManagerService
  ) {
    this._scene = new Scene();
    this._scene.background = new Color(0xf0f0f0f);
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
    this._renderer = new WebGLRenderer({ canvas, antialias: true });
    this._renderer.setSize(width, height, false);

    // DEBUG
    // setInterval(() => {
    //   console.log(this._renderer?.info);
    // }, 5000);

    // start rendering frames
    this.animate();
  }

  public UpdateSize(pixelRatio: number): void {
    const canvas = this._renderer.domElement;
    const width = (canvas.clientWidth * pixelRatio) | 0;
    const height = (canvas.clientHeight * pixelRatio) | 0;
    if (canvas.width !== width || canvas.height !== height) {
      this._renderer.setSize(width, height, false);
      this._camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this._camera.updateProjectionMatrix();
    }

    this.interactionManager.CanvasRect = canvas.getBoundingClientRect();
  }

  private animate(): void {
    this.ngZone.runOutsideAngular(() => {
      TWEEN.update();
      this.objectManager.UpdateStarField();
      this._renderer?.render(this._scene, this._camera);
    });

    requestAnimationFrame(() => {
      this.animate();
    });
  }
}
