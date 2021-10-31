import { MeshObj } from './mesh-obj';
import * as THREE from 'three';
import { Mesh } from 'three';

export class Plate {
  private _hub: THREE.Object3D;
  private _grid: MeshObj[] = [];
  private _polarCoords: THREE.Vector3[] = [];

  constructor(y: number, polarCoords: THREE.Vector3[]) {
    this._polarCoords = polarCoords;

    this._hub = new THREE.Object3D();

    this._polarCoords.forEach((polarCord) => {
      const meshObj = new MeshObj(polarCord.x, y, polarCord.z);
      this._grid.push(meshObj);
      this._hub.add(meshObj.Mesh);
    });
  }

  public get Hub(): THREE.Object3D {
    return this._hub;
  }

  public get Grid(): MeshObj[] {
    return this._grid;
  }
}
