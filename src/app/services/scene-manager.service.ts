import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';

@Injectable({
  providedIn: 'root',
})
export class SceneManagerService {
  private _width: number = 640;
  private _height: number = 480;

  private _renderer!: WebGLRenderer;
  private _scene!: Scene;
  private _camera!: PerspectiveCamera;

  constructor() {
    this.initScene();
  }

  public get scene(): Scene {
    return this._scene;
  }

  public updateSize(width: number, height: number): void {
    this._width = width;
    this._height = height;

    const aspectRatio = this._width / this._height;

    if (!this._camera) {
      this._camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 25);
      // const helper = new THREE.CameraHelper(this._camera);
      // this._scene.add(helper);
    } else {
      this._camera.aspect = aspectRatio;
      this._camera.updateProjectionMatrix();
    }

    if (this._renderer) {
      this._renderer.setSize(width, height);
    }
  }

  public InitRenderer(canvas: HTMLCanvasElement): void {
    if (canvas && !this._renderer) {
      this._renderer = new THREE.WebGLRenderer({ canvas: canvas });
      this._renderer.setSize(this._width, this._height);

      // orbit controls
      // this._controls = new OrbitControls(this._camera, this._canvas);
      // this._controls.target.set(0, 0, 0);
      // this._controls.update();
    }
  }

  public SetCameraPos(position: THREE.Vector3): void {
    if (this._camera) {
      this._camera.position.set(position.x, position.y, position.z);
    }
  }

  public RenderScene(): void {
    this._renderer?.render(this._scene, this._camera);
  }

  private initScene(): void {
    if (!this._scene) {
      this._scene = new THREE.Scene();

      // axes
      const axesHelper = new THREE.AxesHelper(5);
      this._scene.add(axesHelper);

      // lights
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(1, 1, 2);
      light.target.position.set(0, 0, 0);
      this._scene.add(light);
      this._scene.add(light.target);

      // const helper = new THREE.DirectionalLightHelper(light, 5);
      // this._scene.add(helper);

      this._scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    }
  }
}
