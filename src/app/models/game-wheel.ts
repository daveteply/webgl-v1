import { MeshStandardMaterial, Object3D } from 'three';
import { GRID_INC, TWO_PI } from '../game-constants';
import { GamePiece } from './game-piece';
import { PeicePoints } from './piece-points';
import { RotateEase } from './rotate-ease';

export class GameWheel extends Object3D {
  private _theta: number = 0;
  private _rotateEase!: RotateEase;

  constructor(
    y: number,
    meshPoints: PeicePoints[],
    materials: MeshStandardMaterial[]
  ) {
    super();
    this.position.y = y;

    // add game pieces
    meshPoints.forEach((meshPoint) => {
      const gamePeice = new GamePiece(
        meshPoint.polarCoords.x,
        0,
        meshPoint.polarCoords.z,
        meshPoint.rotationY,
        materials
      );
      this.add(gamePeice);
    });
  }

  public get RotateEase(): RotateEase {
    return this._rotateEase;
  }

  public Rotate(theta: number): void {
    this.rotation.y = theta;
  }

  public UpdateTheta(theta: number): void {
    this._theta += theta;

    // restart if full rotation
    if (Math.abs(this._theta) > TWO_PI) {
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

    // this will be used later during draw loop
    this._rotateEase = new RotateEase(currentTheta, this._theta, 10);

    // recalculate game peice theta
    for (const gamePiece of this.children as GamePiece[]) {
      gamePiece.CurrentTheta = this._theta;
    }
  }
}
