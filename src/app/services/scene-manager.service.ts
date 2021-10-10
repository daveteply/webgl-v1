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

  private _canvas!: HTMLCanvasElement;

  constructor() {}

  public updateSize(width: number, height: number): void {
    this._width = width;
    this._height = height;

    const aspectRatio = this._width / this._height;

    if (!this._camera) {
      this._camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100);
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
      this._canvas = canvas;
      this._renderer = new THREE.WebGLRenderer({ canvas: canvas });
      this._renderer.setSize(this._width, this._height);

      // orbit controls
      // this._controls = new OrbitControls(this._camera, this._canvas);
      // this._controls.target.set(0, 0, 0);
      // this._controls.update();
    }
  }

  public RenderScene(): void {
    this._renderer?.render(this._scene, this._camera);
  }
}
