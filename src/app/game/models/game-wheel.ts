import { Easing, Tween } from '@tweenjs/tween.js';
import { MathUtils, Object3D } from 'three';
import { GRID_INC, TWO_PI } from '../game-constants';
import { GamePiece } from './game-piece/game-piece';
import { GamePieceMaterialData } from './game-piece/game-piece-material-data';
import { PiecePoints } from './piece-points';

export class GameWheel extends Object3D {
  private _theta: number = 0;
  private _moveStartTheta: number = 0;

  // 'above' and 'below' are in reference to the y axis
  private _wheelAbove: GameWheel | undefined;
  private _wheelBelow: GameWheel | undefined;

  private _levelChangeTween: any;

  constructor(
    y: number,
    meshPoints: PiecePoints[],
    materialData: GamePieceMaterialData[]
  ) {
    super();
    this.position.y = y;

    // add game pieces
    meshPoints.forEach((meshPoint) => {
      const gamePiece = new GamePiece(
        meshPoint.polarCoords.x,
        0,
        meshPoint.polarCoords.z,
        meshPoint.rotationY,
        materialData
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

  public AnimateLevelStartTween(
    targetY: number,
    delay: number,
    start: boolean
  ): void {
    if (this._levelChangeTween) {
      this._levelChangeTween.stop();
    }

    const delta = {
      y: this.position.y,
      theta: start ? MathUtils.randInt(-20, 20) * GRID_INC : this._theta,
    };
    const target = {
      y: targetY,
      theta: start ? 0 : MathUtils.randInt(-5, 5),
    };

    this._levelChangeTween = new Tween(delta)
      .to(target, 3000)
      .delay(delay)
      .easing(start ? Easing.Sinusoidal.Out : Easing.Sinusoidal.In)
      .onUpdate(() => {
        this.position.y = delta.y;
        this.rotation.y = delta.theta;
        this._theta = delta.theta;
      })
      .start();
  }

  public UpdateMoveStartTheta(): void {
    this._moveStartTheta = this._theta;
  }

  public UpdateTheta(theta: number): void {
    this._theta += theta;

    // restart if full rotation
    if (Math.abs(this._theta) >= TWO_PI) {
      this._theta = 0;
    }

    this.rotation.y = this._theta;
  }

  public SnapToGrid(): boolean {
    // find where the circle has "landed"
    const tier = Math.ceil(this._theta / GRID_INC);

    // calculate the next and previous "steps" of the snap grid
    const deltaNext = Math.abs(this._theta - tier * GRID_INC);
    const deltaPrev = Math.abs(this._theta - (tier - 1) * GRID_INC);

    // snap to grid
    if (deltaNext < deltaPrev) {
      this._theta += deltaNext;
    } else {
      this._theta -= deltaPrev;
    }

    const actualMove = Math.abs(this._theta - this._moveStartTheta) >= GRID_INC;

    const delta = { r: this.rotation.y };
    new Tween(delta)
      .to({ r: this._theta }, 500)
      .easing(actualMove ? Easing.Bounce.Out : Easing.Cubic.InOut)
      .onUpdate(() => {
        this.rotation.y = delta.r;
      })
      .start();

    // recalculate game piece theta (for matching algorithm)
    for (const gamePiece of this.children as GamePiece[]) {
      gamePiece.ThetaOffset = this._theta;
    }

    return actualMove;
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
