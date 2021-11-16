import { Injectable } from '@angular/core';
import { MathUtils, Scene, Vector3 } from 'three';
import { GameWheel } from '../models/game-wheel';
import { PeicePoints } from '../models/piece-points';
import { GRID_ITERATION, GRID_RADIUS } from '../game-constants';
import { MaterialManagerService } from './material-manager.service';
import { GamePiece } from '../models/game-piece';

@Injectable({
  providedIn: 'root',
})
export class ObjectManagerService {
  private _peicePoints: PeicePoints[] = [];
  private _axle: GameWheel[] = [];
  private _activeWheel: GameWheel | undefined;

  constructor(private materialManager: MaterialManagerService) {
    this.initPolarCoords();
  }

  public InitShapes(scene: Scene): void {
    for (let axisInx = -3; axisInx <= 3; axisInx++) {
      const gameWheel = new GameWheel(
        axisInx * 1.2,
        this._peicePoints,
        this.materialManager.Materials
      );
      this._axle.push(gameWheel);
      scene.add(gameWheel);
    }
  }

  public SetActiveWheel(wheel: GameWheel): void {
    if (wheel) {
      this._activeWheel = wheel;
    }
  }

  public UpdateShapes(): void {
    // easing (after pan)
    if (this._activeWheel?.RotateEase?.HasNext) {
      this._activeWheel.Rotate(this._activeWheel?.RotateEase?.Next);
    }

    // this._axle[0].children[25].rotateZ(0.03);
    // console.log((this._axle[0].children[25] as GamePiece).CurrentTheta);
  }

  public FindWheel(gamePieceId: number): GameWheel | undefined {
    return this._axle.find((a) => a.children.find((g) => g.id === gamePieceId));
  }

  public get Axle(): GameWheel[] {
    return this._axle;
  }

  private initPolarCoords(): void {
    for (let i = 0; i < 360; i += GRID_ITERATION) {
      const rad = MathUtils.degToRad(i);
      this._peicePoints.push({
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
