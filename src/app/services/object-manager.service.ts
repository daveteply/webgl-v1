import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { MathUtils, Scene } from 'three';
import { MeshObj } from '../models/mesh-obj';
import { RotateEase } from '../models/rotate-ease';
import { GRID_ITERATION, GRID_RADIUS } from '../wgl-constants';

@Injectable({
  providedIn: 'root',
})
export class ObjectManagerService {
  private _centerMesh!: THREE.Object3D;
  private _grid: MeshObj[] = [];
  private _rotateEase!: RotateEase;

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

      // DEBUG help find the 1st object
      if (i === 0) {
        meshObj.Mesh.scale.x *= 2;
      }

      this._grid.push(meshObj);
      this._centerMesh.add(meshObj.Mesh);
    }
    scene.add(this._centerMesh);
  }

  public Rotate(rotationRadianAmount: number): void {
    this._centerMesh.rotation.y = rotationRadianAmount;
  }

  public RotateEase(rotateEase: RotateEase): void {
    this._rotateEase = rotateEase;
  }

  public UpdateShapes(): void {
    // tumble objects
    this._grid.forEach((meshObj) => {
      meshObj.Mesh.rotateX(meshObj.Tumble.x);
      meshObj.Mesh.rotateY(meshObj.Tumble.y);
      meshObj.Mesh.rotateZ(meshObj.Tumble.z);
    });

    // easing
    if (this._rotateEase?.HasNext) {
      this.Rotate(this._rotateEase.Next);
    }
  }
}
