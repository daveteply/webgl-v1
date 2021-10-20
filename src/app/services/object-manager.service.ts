import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { MathUtils, Scene } from 'three';
import { MeshObj } from '../models/mesh-obj';
import { GRID_ITERATION, GRID_RADIUS } from '../wgl-constants';

@Injectable({
  providedIn: 'root',
})
export class ObjectManagerService {
  private _centerMesh!: THREE.Object3D;
  private _grid: MeshObj[] = [];

  constructor() {}

  public InitShapes(scene: Scene): void {
    this._centerMesh = new THREE.Object3D();

    for (let i = 0; i < 360; i += GRID_ITERATION) {
      const rad = MathUtils.degToRad(i);
      const x = GRID_RADIUS * Math.cos(rad);
      const z = GRID_RADIUS * Math.sin(rad);

      const meshObj = new MeshObj();
      meshObj.Mesh.position.x = x;
      meshObj.Mesh.position.z = z;

      this._grid.push(meshObj);
      this._centerMesh.add(meshObj.Mesh);
    }
    scene.add(this._centerMesh);
  }

  public UpdateShapes(): void {
    this._centerMesh.rotateY(0.004);
    this._centerMesh.rotateX(0.002);

    this._grid.forEach((meshObj) => {
      meshObj.Mesh.rotateX(meshObj.Tumble.x);
      meshObj.Mesh.rotateY(meshObj.Tumble.y);
      meshObj.Mesh.rotateZ(meshObj.Tumble.z);
    });
  }
}
