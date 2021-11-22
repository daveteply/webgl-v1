import { Injectable } from '@angular/core';
import { MathUtils, Scene, Vector3 } from 'three';
import { GameWheel } from '../models/game-wheel';
import { PiecePoints } from '../models/piece-points';
import {
  GRID_STEP_DEGREES,
  GRID_MAX_DEGREES,
  GRID_RADIUS,
  GRID_VERTICAL_OFFSET,
} from '../game-constants';
import { MaterialManagerService } from './material-manager.service';
import { GamePiece } from '../models/game-piece';

@Injectable({
  providedIn: 'root',
})
export class ObjectManagerService {
  private _piecePoints: PiecePoints[] = [];
  private _axle: GameWheel[] = [];
  private _activeWheel: GameWheel | undefined;

  private _boardLocked: boolean = false;

  constructor(private materialManager: MaterialManagerService) {
    this.initPolarCoords();
  }

  public get Axle(): GameWheel[] {
    return this._axle;
  }

  public get BoardLocked(): boolean {
    return this._boardLocked;
  }

  public InitShapes(scene: Scene): void {
    for (let axisInx = -3; axisInx <= 3; axisInx++) {
      const gameWheel = new GameWheel(
        axisInx * GRID_VERTICAL_OFFSET,
        this._piecePoints,
        this.materialManager.Materials
      );
      this._axle.push(gameWheel);
      scene.add(gameWheel);
    }

    // assign iteration values (wheels are built bottom-up)
    for (let i = 0; i < this._axle.length; i++) {
      if (i === 0) {
        // "bottom" of wheel stack
        this._axle[i].Above = this._axle[i + 1];
        this._axle[i].Below = undefined;
      } else if (i === this._axle.length - 1) {
        // "top" of wheel stack
        this._axle[i].Above = undefined;
        this._axle[i].Below = this._axle[i - 1];
      } else {
        this._axle[i].Above = this._axle[i + 1];
        this._axle[i].Below = this._axle[i - 1];
      }
    }
  }

  // for panning/horizontal scrubbing interaction
  public SetActiveWheel(wheel: GameWheel): void {
    if (wheel) {
      this._activeWheel = wheel;
    }
  }

  // animation loop
  public UpdateShapes(): void {
    // easing (after pan)
    if (this._activeWheel?.RotateEase?.HasNext) {
      this._activeWheel.Rotate(this._activeWheel?.RotateEase?.Next);
    }

    // check game piece states
    this._axle.forEach((axle) => {
      for (const gamePiece of axle.children as GamePiece[]) {
        if (this._boardLocked && !gamePiece.IsMatch) {
          gamePiece.LockPiece();
        }
      }
    });
  }

  public LockBoard(locked: boolean): void {
    this._boardLocked = locked;
  }

  private initPolarCoords(): void {
    for (let i = 0; i < GRID_MAX_DEGREES; i += GRID_STEP_DEGREES) {
      const rad = MathUtils.degToRad(i);
      this._piecePoints.push({
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
