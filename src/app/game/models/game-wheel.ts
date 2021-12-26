import { Object3D } from 'three';
import { GRID_INC, TWO_PI } from '../game-constants';
import { GameMaterial } from './game-material';
import { GamePiece } from './game-piece';
import { Betweener } from './keyframes/betweener';
import { PiecePoints } from './piece-points';

export class GameWheel extends Object3D {
  private _theta: number = 0;
  private _betweener!: Betweener;

  // 'above' and 'below' are in reference to the y axis
  private _wheelAbove: GameWheel | undefined;
  private _wheelBelow: GameWheel | undefined;

  constructor(y: number, meshPoints: PiecePoints[], materials: GameMaterial[]) {
    super();
    this.position.y = y;

    // add game pieces
    meshPoints.forEach((meshPoint) => {
      const gamePiece = new GamePiece(
        meshPoint.polarCoords.x,
        0,
        meshPoint.polarCoords.z,
        meshPoint.rotationY,
        materials
      );
      this.add(gamePiece);
    });

    // add next and previous iteration references
    for (let i = 0; i < this.children.length; i++) {
      const gamePiece = this.children[i] as GamePiece;
      if (i === 0) {
        // first
        gamePiece.Prev = this.children[this.children.length - 1] as GamePiece;
        gamePiece.Next = this.children[i + 1] as GamePiece;
      } else if (i === this.children.length - 1) {
        // last
        gamePiece.Prev = this.children[i - 1] as GamePiece;
        gamePiece.Next = this.children[0] as GamePiece;
      } else {
        gamePiece.Prev = this.children[i - 1] as GamePiece;
        gamePiece.Next = this.children[i + 1] as GamePiece;
      }
    }
  }

  set Above(gameWheel: GameWheel | undefined) {
    this._wheelAbove = gameWheel;
  }
  get Above(): GameWheel | undefined {
    return this._wheelAbove;
  }

  set Below(gameWheel: GameWheel | undefined) {
    this._wheelBelow = gameWheel;
  }
  get Below(): GameWheel | undefined {
    return this._wheelBelow;
  }

  get EaseBetweener(): Betweener {
    return this._betweener;
  }

  public Rotate(theta: number): void {
    this.rotation.y = theta;
  }

  public UpdateTheta(theta: number): void {
    this._theta += theta;

    // restart if full rotation
    if (Math.abs(this._theta) >= TWO_PI) {
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

    // this will be used in main draw loop
    this._betweener = new Betweener(currentTheta, this._theta, 10);

    // recalculate game piece theta (for matching algorithm)
    for (const gamePiece of this.children as GamePiece[]) {
      gamePiece.ThetaOffset = this._theta;
    }
  }

  public ResetIsMatch(): void {
    for (const gamePiece of this.children as GamePiece[]) {
      gamePiece.IsMatch = false;
    }
  }

  public Dispose(): void {
    for (const gamePiece of this.children as GamePiece[]) {
      gamePiece.Dispose();
    }
  }
}