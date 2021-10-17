import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { Scene } from 'three';

@Injectable({
  providedIn: 'root',
})
export class ObjectManagerService {
  private _box: THREE.BoxGeometry;
  private _material: THREE.MeshStandardMaterial;

  private _centerMesh!: THREE.Object3D;
  private _grid: THREE.Mesh[] = [];

  constructor() {
    this._box = new THREE.BoxGeometry();
    this._material = new THREE.MeshStandardMaterial({ color: 'purple' });
  }

  public InitShapes(scene: Scene): void {
    this._centerMesh = new THREE.Object3D();

    this._grid.push(new THREE.Mesh(this._box, this._material));

    this._centerMesh.add(...this._grid);

    scene.add(this._centerMesh);
  }

  public UpdateShapes(): void {
    this._grid[0].rotateX(0.02);
    this._grid[0].rotateY(0.03);
    this._grid[0].rotateZ(0.01);
  }
}
