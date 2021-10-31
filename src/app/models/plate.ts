import { Object3D, Vector3 } from 'three';
import { MeshObj } from './mesh-obj';

export class Plate {
  private _hub: Object3D;
  private _grid: MeshObj[] = [];
  private _polarCoords: Vector3[] = [];

  constructor(y: number, polarCoords: Vector3[]) {
    this._polarCoords = polarCoords;

    this._hub = new Object3D();

    this._polarCoords.forEach((polarCord) => {
      const meshObj = new MeshObj(polarCord.x, y, polarCord.z);
      this._grid.push(meshObj);
      this._hub.add(meshObj.Mesh);
    });
  }

  public get Hub(): Object3D {
    return this._hub;
  }

  public get Grid(): MeshObj[] {
    return this._grid;
  }
}
