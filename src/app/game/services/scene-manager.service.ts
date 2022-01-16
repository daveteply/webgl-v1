import { Injectable } from '@angular/core';
import {
  Color,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three';
import { InteractionManagerService } from './interaction-manager.service';
import { ObjectManagerService } from './object-manager.service';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Injectable()
export class SceneManagerService {
  private _width: number = 0;
  private _height: number = 0;

  private _renderer!: WebGLRenderer;
  private _scene!: Scene;
  private _camera!: PerspectiveCamera;

  private _pointLight!: PointLight;

  constructor(
    private objectManager: ObjectManagerService,
    private interactionManager: InteractionManagerService
  ) {}

  get scene(): Scene {
    return this._scene;
  }

  public InitScene(): void {
    if (!this._scene) {
      this._scene = new Scene();
      this._scene.background = new Color(0xf0f0f0f);

      // axes
      // const axesHelper = new AxesHelper(5);
      // this._scene.add(axesHelper);

      // lights
      this._pointLight = new PointLight(0xffffff, 1);
      this._scene.add(this._pointLight);

      this.objectManager.InitShapes(this._scene);
    }
  }

  public UpdateSize(rect: DOMRect): void {
    this._width = rect.width;
    this._height = rect.height;

    const aspectRatio = this._width / this._height;

    if (!this._camera) {
      this._camera = new PerspectiveCamera(45, aspectRatio, 1, 75);
      this.objectManager.SetCamera(this._camera);

      this._pointLight?.position.copy(this._camera.position);

      // face camera "up"
      this._camera.rotation.x = Math.PI / 2;

      // const helper = new CameraHelper(this._camera);
      // this._scene.add(helper);
    } else {
      this._camera.aspect = aspectRatio;
      this._camera.updateProjectionMatrix();
      this._pointLight.position.copy(this._camera.position);
    }

    if (this._renderer) {
      this._renderer.setSize(this._width, this._height, false);
    }

    this.interactionManager.UpdateSize(rect, this._camera);
  }

  public InitRenderer(canvas: HTMLCanvasElement): void {
    if (canvas) {
      this._renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
    }
    if (this._renderer) {
      this._renderer.setSize(this._width, this._height, false);
    }

    // orbit controls
    // this._controls = new OrbitControls(this._camera, this._canvas);
    // this._controls.target.set(0, 0, 0);
    // this._controls.update();
  }

  // called during main animation loop
  public RenderScene(): void {
    this._renderer?.render(this._scene, this._camera);
  }
}
