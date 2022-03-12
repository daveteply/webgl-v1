import { Injectable, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CameraHelper, AxesHelper, Color, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from 'three';
import { InteractionManagerService } from './interaction-manager.service';
import { ObjectManagerService } from './object-manager.service';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as TWEEN from '@tweenjs/tween.js';

@Injectable()
export class SceneManagerService {
  private _width: number = 0;
  private _height: number = 0;

  private _canvas!: HTMLCanvasElement;
  private _controls!: OrbitControls;

  private _renderer!: WebGLRenderer;
  private _scene!: Scene;
  private _camera!: PerspectiveCamera;

  private _pointLight!: PointLight;

  constructor(
    private ngZone: NgZone,
    private objectManager: ObjectManagerService,
    private interactionManager: InteractionManagerService
  ) {}

  public InitScene(): void {
    if (!this._scene) {
      this._scene = new Scene();
      this._scene.background = new Color(0xf0f0f0f);

      // pass along to object manager
      this.objectManager.SetScene(this._scene);

      // axes
      if (environment.includeHelpers) {
        const axesHelper = new AxesHelper(5);
        this._scene.add(axesHelper);
      }

      // lights
      this._pointLight = new PointLight(0xffffff, 1);
      this._scene.add(this._pointLight);
    }
  }

  public UpdateSize(width: number, height: number): void {
    this._width = width;
    this._height = height;

    const aspectRatio = this._width / this._height;

    if (!this._camera) {
      this._camera = new PerspectiveCamera(45, aspectRatio, 1, 75);
      this._camera.position.z = 5;
      this.objectManager.SetCamera(this._camera);

      if (environment.includeHelpers) {
        const helper = new CameraHelper(this._camera);
        this._scene.add(helper);
      }

      // orbit controls
      if (environment.includeHelpers) {
        this._controls = new OrbitControls(this._camera, this._canvas);
        this._controls.target.set(0, 0, 0);
        this._controls.update();
      }

      // update interaction manager
      this.interactionManager.Camera = this._camera;
    } else {
      this._camera.aspect = aspectRatio;
      this._camera.updateProjectionMatrix();
    }

    if (this._renderer) {
      this._renderer.setSize(this._width, this._height, false);
    }

    // TODO:
    //renderer.setPixelRatio( window.devicePixelRatio );

    // start rendering frames
    this.animate();
  }

  public InitRenderer(canvas: HTMLCanvasElement): void {
    if (canvas) {
      this._canvas = canvas;
      this._renderer = new WebGLRenderer({
        canvas: this._canvas,
        antialias: true,
      });
    }
    if (this._renderer) {
      this._renderer.setSize(this._width, this._height, false);
    }
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
