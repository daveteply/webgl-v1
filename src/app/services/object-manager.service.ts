import { Injectable } from '@angular/core';
import { MathUtils, Scene, Vector3 } from 'three';
import { COLORS_256, MaterialColor } from '../models/material-color';
import { MeshPoints } from '../models/mesh-points';
import { Plate } from '../models/plate';
import { GRID_ITERATION, GRID_RADIUS } from '../wgl-constants';

@Injectable({
  providedIn: 'root',
})
export class ObjectManagerService {
  private _meshPoints: MeshPoints[] = [];
  private _axis: Plate[] = [];
  private _activePlate: Plate | undefined;

  constructor() {
    this.initPolarCoords();
  }

  public InitShapes(scene: Scene): void {
    // select some random color
    const colors = this.getRandomColors(7);

    for (let axisInx = -3; axisInx <= 3; axisInx++) {
      const plate = new Plate(axisInx * 1.2, this._meshPoints, colors);
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
    // this._axis.forEach((a) => {
    //   a.Grid.forEach((obj) => {
    //     obj.Tumble();
    //   });
    // });

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
      this._meshPoints.push({
        polarCoords: new Vector3(
          GRID_RADIUS * Math.cos(rad),
          0,
          GRID_RADIUS * Math.sin(rad)
        ),
        rotationY: rad * -1,
      });
    }
  }

  private getRandomColors(count: number): MaterialColor[] {
    // shuffle
    const shuffled = COLORS_256.map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    return shuffled.slice(0, count);
  }
}
