import { Object3D } from 'three';
import { GRID_INC } from '../wgl-constants';
import { MaterialColor } from './material-color';
import { MeshObj } from './mesh-obj';
import { MeshPoints } from './mesh-points';
import { RotateEase } from './rotate-ease';

export class Plate {
  private _hub: Object3D;
  private _grid: MeshObj[] = [];

  private _rotateEase!: RotateEase;

  private _theta: number = 0;

  constructor(y: number, meshPoints: MeshPoints[], colors: MaterialColor[]) {
    this._hub = new Object3D();
    this._hub.position.y = y;

    meshPoints.forEach((meshPoint) => {
      const meshObj = new MeshObj(
        meshPoint.polarCoords.x,
        0,
        meshPoint.polarCoords.z,
        colors
      );
      meshObj.Mesh.rotateY(meshPoint.rotationY);

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

  public get RotateEase(): RotateEase {
    return this._rotateEase;
  }

  public Rotate(theta: number): void {
    this._hub.rotation.y = theta;
  }

  public UpdateTheta(theta: number): void {
    this._theta += theta;

    // restart if full rotation
    if (Math.abs(this._theta) > 2 * Math.PI) {
      this._theta = 0;
    }

    this.Rotate(this._theta);
  }

  public SnapToGrid(): void {
    // find where the circle has "landed"
    const tier = Math.ceil(this._theta / GRID_INC);

    // calculate the next and previous "steps" of the snap grid
    const deltaNext = Math.abs(this._theta - tier * GRID_INC);
    const deltaPrev = Math.abs(this._theta - (tier - 1) * GRID_INC);

    // snap to grid
    const currentTheta = this._theta;
    if (deltaNext < deltaPrev) {
      this._theta += deltaNext;
    } else {
      this._theta -= deltaPrev;
    }

    this._rotateEase = new RotateEase(currentTheta, this._theta, 10);
  }
}
