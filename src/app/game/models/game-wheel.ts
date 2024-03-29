import { Easing, Tween } from '@tweenjs/tween.js';
import { MathUtils, Object3D } from 'three';
import { GRID_INC, TWO_PI } from '../game-constants';
import { LevelGeometryType } from '../level-geometry-type';
import { WheelMaterial } from '../services/material/material-models';
import { GamePiece } from './game-piece/game-piece';
import { PiecePoints } from './piece-points';
import { PowerMoveType } from './power-move-type';

export class GameWheel extends Object3D {
  private _theta = 0;
  private _moveStartTheta = 0;

  private _originalPositionY: number;

  // 'above' and 'below' are in reference to the y axis
  private _wheelAbove: GameWheel | undefined;
  private _wheelBelow: GameWheel | undefined;

  private _levelChangeTween: any;
  private _horizontalMotionTween: any;

  // game save state
  get Theta(): number {
    return this._theta;
  }

  constructor(y: number, meshPoints: PiecePoints[]) {
    super();
    this._originalPositionY = y;
    this.position.y = y;

    // add game pieces
    meshPoints.forEach((meshPoint) => {
      const gamePiece = new GamePiece(meshPoint.polarCoords.x, 0, meshPoint.polarCoords.z, meshPoint.rotationY);
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

  public Reset(levelGeometryType: LevelGeometryType): void {
    this._levelChangeTween?.stop();
    this._horizontalMotionTween?.stop();

    this._theta = 0;
    this.position.y = this._originalPositionY;
    this.rotation.y = 0;

    for (let i = 0; i < this.children.length; i++) {
      const gamePiece = this.children[i] as GamePiece;
      gamePiece.Reset(levelGeometryType);
    }
  }

  public UpdateMaterials(wheelMaterials: WheelMaterial): void {
    for (let i = 0; i < this.children.length; i++) {
      const gamePiece = this.children[i] as GamePiece;
      gamePiece.UpdateMaterials(wheelMaterials.pieceMaterials[i]);
    }
  }

  public AnimateLevelStartTween(targetY: number, delay: number, start: boolean, spinDirection: number): void {
    this._levelChangeTween?.stop();

    let introSpinRangeMin = -10;
    let introSpinRangeMax = 10;
    switch (spinDirection) {
      case 1:
        introSpinRangeMin = 10;
        introSpinRangeMax = 20;
        break;
      case 2:
        introSpinRangeMin = -20;
        introSpinRangeMax = -10;
        break;
      default:
      // use original values
    }

    const delta = {
      y: this.position.y,
      theta: start ? MathUtils.randInt(introSpinRangeMin, introSpinRangeMax) * GRID_INC : this._theta,
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
      })
      .start();

    // opacity of each game piece
    for (const gamePiece of this.children as GamePiece[]) {
      gamePiece.AnimateLevelChangeTween(start);
    }
  }

  public AnimateHorizontalPowerMove(moveType: PowerMoveType): void {
    this._horizontalMotionTween?.stop();

    const startTheta = this._theta;

    let targetTheta = 0;
    switch (moveType) {
      case PowerMoveType.HorizontalLeft:
        targetTheta = MathUtils.randInt(5, 10) * GRID_INC + this._theta;
        break;

      case PowerMoveType.HorizontalRight:
        targetTheta = MathUtils.randInt(-10, -5) * GRID_INC + this._theta;
        break;

      case PowerMoveType.HorizontalMix:
        targetTheta = MathUtils.randInt(-10, 10) * GRID_INC + this._theta;
        break;
    }

    this.animateHorizontal(startTheta, targetTheta);
  }

  public AnimateHorizontalMotion(startTheta: number, targetTheta: number, isRestoring = false): void {
    this.animateHorizontal(startTheta, targetTheta, isRestoring);
  }

  public AnimateVerticalPowerMove(moveType: PowerMoveType): void {
    for (let i = 0; i < this.children.length; i++) {
      const gamePiece = this.children[i] as GamePiece;

      // including zero to allow some not to rotate
      const turns = MathUtils.randInt(0, 3);
      switch (moveType) {
        case PowerMoveType.VerticalUp:
          gamePiece.AnimateFlipTween(turns, true);
          break;

        case PowerMoveType.VerticalDown:
          gamePiece.AnimateFlipTween(turns, false);
          break;

        case PowerMoveType.VerticalMix:
          gamePiece.AnimateFlipTween(turns, MathUtils.randInt(0, 1) === 1);
          break;
      }
    }
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
    for (let i = 0; i < this.children.length; i++) {
      const gamePiece = this.children[i] as GamePiece;
      gamePiece.ThetaOffset = this._theta;
    }

    return actualMove;
  }

  public ResetIsMatch(): void {
    for (let i = 0; i < this.children.length; i++) {
      const gamePiece = this.children[i] as GamePiece;
      gamePiece.IsMatch = false;
    }
  }

  private animateHorizontal(startTheta: number, stopTheta: number, isRestoring = false): void {
    const delta = { theta: startTheta };
    const target = { theta: stopTheta };

    this._horizontalMotionTween = new Tween(delta)
      .to(target, isRestoring ? 500 : 2000)
      .easing(isRestoring ? Easing.Circular.Out : Easing.Elastic.In)
      .onUpdate(() => {
        this._theta = delta.theta;
        this.rotation.y = this._theta;
      })
      .onComplete(() => {
        this.SnapToGrid();
      })
      .start();
  }
}
