import { Injectable } from '@angular/core';
import { MathUtils, Scene, Vector3 } from 'three';
import { MeshPoints } from '../models/mesh-points';
import { Plate } from '../models/plate';
import { GRID_ITERATION, GRID_RADIUS } from '../wgl-constants';
import { MaterialManagerService } from './material-manager.service';

@Injectable({
  providedIn: 'root',
})
export class ObjectManagerService {
  private _meshPoints: MeshPoints[] = [];
  private _plateStack: Plate[] = [];
  private _activePlate: Plate | undefined;

  constructor(private materialManager: MaterialManagerService) {
    this.initPolarCoords();
  }

  public InitShapes(scene: Scene): void {
    for (let axisInx = -3; axisInx <= 3; axisInx++) {
      const plate = new Plate(
        axisInx * 1.2,
        this._meshPoints,
        this.materialManager.Materials
      );
      this._plateStack.push(plate);
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

    // DEBUG
    // this._plateStack[0].Hub.children[28].rotateX(0.01);
    // const target = new Vector3();
    // this._plateStack[0].Hub.children[28].getWorldPosition(target);
    // console.log(target);

    // easing (after pan)
    if (this._activePlate?.RotateEase?.HasNext) {
      this._activePlate.Rotate(this._activePlate?.RotateEase?.Next);
    }
  }

  public FindPlate(uuid: string): Plate | undefined {
    return this._plateStack.find((a) =>
      a.Hub.children.find((g) => g.uuid === uuid)
    );
  }

  public get Axis(): Plate[] {
    return this._plateStack;
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
}
