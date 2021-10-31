import { Injectable } from '@angular/core';
import { MathUtils, Scene, Vector3 } from 'three';
import { Plate } from '../models/plate';
import { RotateEase } from '../models/rotate-ease';
import { GRID_ITERATION, GRID_RADIUS } from '../wgl-constants';

@Injectable({
  providedIn: 'root',
})
export class ObjectManagerService {
  private _polarCoords: Vector3[] = [];
  private _axis: Plate[] = [];
  private _rotateEase!: RotateEase;

  constructor() {
    this.initPolarCoords();
  }

  public InitShapes(scene: Scene): void {
    for (let axisInx = -4; axisInx <= 4; axisInx++) {
      const plate = new Plate(axisInx * 1.5, this._polarCoords);
      this._axis.push(plate);
      scene.add(plate.Hub);
    }
  }

  public Rotate(rotationRadianAmount: number): void {
    this._axis.forEach(
      (plate) => (plate.Hub.rotation.y = rotationRadianAmount)
    );
  }

  public RotateEase(rotateEase: RotateEase): void {
    this._rotateEase = rotateEase;
  }

  public UpdateShapes(): void {
    // tumble objects (for debugging)
    this._axis.forEach((a) => {
      a.Grid.forEach((obj) => {
        obj.Mesh.rotateX(obj.Tumble.x);
        obj.Mesh.rotateY(obj.Tumble.y);
        obj.Mesh.rotateZ(obj.Tumble.z);
      });
    });

    // easing
    if (this._rotateEase?.HasNext) {
      this.Rotate(this._rotateEase.Next);
    }
  }

  private initPolarCoords(): void {
    for (let i = 0; i < 360; i += GRID_ITERATION) {
      const rad = MathUtils.degToRad(i);
      this._polarCoords.push(
        new Vector3(GRID_RADIUS * Math.cos(rad), 0, GRID_RADIUS * Math.sin(rad))
      );
    }
  }
}
