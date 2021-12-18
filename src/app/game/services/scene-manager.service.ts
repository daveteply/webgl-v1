import { Injectable } from '@angular/core';
import {
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { InteractionManagerService } from './interaction-manager.service';
import { ObjectManagerService } from './object-manager.service';

@Injectable()
export class SceneManagerService {
  private _width: number = 0;
  private _height: number = 0;

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

  public UpdateSize(rect: DOMRect): void {
    this._width = rect.width;
    this._height = rect.height;

    const aspectRatio = this._width / this._height;

    if (!this._camera) {
      this._camera = new PerspectiveCamera(45, aspectRatio, 1, 25);
      this._camera.position.set(0, 0, 5);

      // const helper = new CameraHelper(this._camera);
      // this._scene.add(helper);
    } else {
      this._camera.aspect = aspectRatio;
      this._camera.updateProjectionMatrix();
    }

    if (this._renderer) {
      this._renderer.setSize(this._width, this._height, false);
    }

    this.interactionManager.UpdateSize(rect, this._camera);
  }

  public InitRenderer(canvas: HTMLCanvasElement): void {
    if (canvas && !this._renderer) {
      this._renderer = new WebGLRenderer({ canvas: canvas });
      this._renderer.setSize(this._width, this._height, false);

      // orbit controls
      // this._controls = new OrbitControls(this._camera, this._canvas);
      // this._controls.target.set(0, 0, 0);
      // this._controls.update();
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
      light.position.set(0, 0, 5);
      light.target.position.set(0, 0, 0);
      this._scene.add(light);
      this._scene.add(light.target);

      this._scene.background = new Color(0xf0f0f0f);

      // const helper = new DirectionalLightHelper(light, 5);
      // this._scene.add(helper);

      this.objectManager.InitShapes(this._scene);
    }
  }
}
