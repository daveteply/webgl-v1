import { EventEmitter, Injectable } from '@angular/core';
import { Group, MathUtils, Scene, Vector3 } from 'three';
import { GameWheel } from '../models/game-wheel';
import { PiecePoints } from '../models/piece-points';
import {
  GRID_STEP_DEGREES,
  GRID_MAX_DEGREES,
  GRID_RADIUS,
  GRID_VERTICAL_OFFSET,
} from '../game-constants';
import { MaterialManagerService } from './material-manager.service';
import { GamePiece } from '../models/game-piece/game-piece';
import { EffectsManagerService } from './effects-manager.service';
import * as TWEEN from '@tweenjs/tween.js';

@Injectable()
export class ObjectManagerService {
  // create and store polar coordinates to draw game pieces
  private _piecePoints: PiecePoints[] = [];

  // store destination vertical (y axis) coordinates
  private _verticalTargets: number[] = [];

  private _axle: GameWheel[] = [];
  private _stack: Group;
  private _activeWheel: GameWheel | undefined;

  private _scene!: Scene;

  // events
  public LevelCompleted: EventEmitter<void> = new EventEmitter();

  constructor(
    private materialManager: MaterialManagerService,
    private effectsManager: EffectsManagerService
  ) {
    this._stack = new Group();
    this.initCoords();
  }

  get Axle(): GameWheel[] {
    return this._axle;
  }

  public InitShapes(scene?: Scene): void {
    // store reference to scene for later level change
    if (scene && !this._scene) {
      this._scene = scene;
    }

    // clear existing objects
    this.dispose();

    // select colors for the current level
    this.materialManager.InitMaterials();

    // start off-screen below or above (part of intro animation)
    const startY = MathUtils.randInt(1, 3) === 1 ? 10 : -10;
    // create all the objects
    this._verticalTargets.forEach(() => {
      const gameWheel = new GameWheel(
        startY,
        this._piecePoints,
        this.materialManager.MaterialData
      );
      this._axle.push(gameWheel);
      this._stack.add(gameWheel);
    });

    this._scene.add(this._stack);

    // assign iteration values (wheels are built bottom-up)
    this.assignIterationValues();

    this.effectsManager.InitIntoAnimation(
      this._axle,
      this._verticalTargets,
      startY
    );
  }

  //////////////////////
  //  animation loop  //
  //////////////////////
  public UpdateShapes(): void {
    TWEEN.update();

    this.effectsManager.UpdateEffects(this._axle);

    // easing (after pan)
    if (this._activeWheel?.EaseBetweener?.HasNext) {
      this._activeWheel.Rotate(this._activeWheel?.EaseBetweener?.Next);
    }
  }

  // for panning/horizontal scrubbing interaction
  public SetActiveWheel(wheel: GameWheel): void {
    if (wheel) {
      this._activeWheel = wheel;
    }
  }

  private assignIterationValues(): void {
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

  private initCoords(): void {
    // polar coordinates to draw shapes
    for (let i = 0; i < GRID_MAX_DEGREES; i += GRID_STEP_DEGREES) {
      const rad = MathUtils.degToRad(i);
      const x = GRID_RADIUS * Math.cos(rad);
      const z = GRID_RADIUS * Math.sin(rad);
      this._piecePoints.push({
        polarCoords: new Vector3(x, 0, z),
        rotationY: rad * -1,
      });
    }

    // vertical targets
    for (let axisInx = -3; axisInx <= 3; axisInx++) {
      this._verticalTargets.push(axisInx * GRID_VERTICAL_OFFSET);
    }
  }

  private dispose(): void {
    // cascade dispose through all game pieces
    if (this._axle.length) {
      this._axle.forEach((a) => a.Dispose());
    }
    // reset array
    this._axle = [];
    // remove all objects
    this._stack.clear();
  }
}
