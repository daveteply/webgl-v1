import { BoxGeometry, Mesh, MeshStandardMaterial } from 'three';

export class GamePiece extends Mesh {
  private _origTheta: number;
  private _currentTheta: number;

  constructor(
    x: number,
    y: number,
    z: number,
    rotation: number,
    materials: MeshStandardMaterial[]
  ) {
    super(
      new BoxGeometry(),
      materials[Math.floor(Math.random() * materials.length)]
    );

    this.position.set(x, y, z);
    this.rotateY(rotation);

    this._origTheta = rotation;
    this._currentTheta = rotation;
  }

  set CurrentTheta(theta: number) {
    this._currentTheta = this._origTheta + theta;
  }

  get CurrentTheta(): number {
    return this._currentTheta;
  }
}
