import { Injectable } from '@angular/core';
import { MathUtils, Scene, Vector3 } from 'three';
import { Plate } from '../models/plate';
import { GRID_ITERATION, GRID_RADIUS } from '../wgl-constants';

@Injectable({
  providedIn: 'root',
})
export class ObjectManagerService {
  private _polarCoords: Vector3[] = [];
  private _axis: Plate[] = [];
  private _activePlate: Plate | undefined;

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

  public SetActivePlate(plate: Plate): void {
    if (plate) {
      this._activePlate = plate;
    }
  }

  public UpdateShapes(): void {
    // tumble objects (for debugging)
    this._axis.forEach((a) => {
      a.Grid.forEach((obj) => {
        obj.Tumble();
      });
    });

    // easing (after pan)
    if (this._activePlate?.RotateEase?.HasNext) {
      this._activePlate.Rotate(this._activePlate?.RotateEase?.Next);
    }
  }

  public FindPlate(uuid: string): Plate | undefined {
    const target = this._axis.find((a) =>
      a.Grid.find((g) => g.Mesh.uuid === uuid)
    );
    return target;
  }

  public get Axis(): Plate[] {
    return this._axis;
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
