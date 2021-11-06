import { Injectable } from '@angular/core';
import {
  AmbientLight,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { InteractionManagerService } from './interaction-manager.service';
import { ObjectManagerService } from './object-manager.service';

@Injectable({
  providedIn: 'root',
})
export class SceneManagerService {
  private _width: number = 640;
  private _height: number = 480;

  private _renderer!: WebGLRenderer;
  private _scene!: Scene;
  private _camera!: PerspectiveCamera;

  constructor(
    private objectManager: ObjectManagerService,
    private interactionManager: InteractionManagerService
  ) {
    this.initScene();
  }

  public get scene(): Scene {
    return this._scene;
  }

  public UpdateSize(width: number, height: number): void {
    this._width = width;
    this._height = height;

    const aspectRatio = this._width / this._height;

    if (!this._camera) {
      this._camera = new PerspectiveCamera(75, aspectRatio, 0.1, 25);
      // const helper = new CameraHelper(this._camera);
      // this._scene.add(helper);
    } else {
      this._camera.aspect = aspectRatio;
      this._camera.updateProjectionMatrix();
    }

    if (this._renderer) {
      this._renderer.setSize(width, height);
    }

    this.interactionManager.OnResize(this._width, this._height, this._camera);
  }

  public InitRenderer(canvas: HTMLCanvasElement): void {
    if (canvas && !this._renderer) {
      this._renderer = new WebGLRenderer({ canvas: canvas });
      this._renderer.setSize(this._width, this._height);

      // orbit controls
      // this._controls = new OrbitControls(this._camera, this._canvas);
      // this._controls.target.set(0, 0, 0);
      // this._controls.update();
    }
  }

  public SetCameraPos(position: Vector3): void {
    if (this._camera) {
      this._camera.position.set(position.x, position.y, position.z);
    }
  }

  public RenderScene(): void {
    this._renderer?.render(this._scene, this._camera);
  }

  private initScene(): void {
    if (!this._scene) {
      this._scene = new Scene();

      // axes
      // const axesHelper = new AxesHelper(5);
      // this._scene.add(axesHelper);

      // lights
      const light = new DirectionalLight(0xffffff, 1);
      light.position.set(1, 1, 2);
      light.target.position.set(0, 0, 0);
      this._scene.add(light);
      this._scene.add(light.target);
      this._scene.add(new AmbientLight(0xffffff, 0.2));

      this._scene.background = new Color(0xf0f0f0f);

      // const helper = new DirectionalLightHelper(light, 5);
      // this._scene.add(helper);

      this.objectManager.InitShapes(this._scene);
    }
  }
}