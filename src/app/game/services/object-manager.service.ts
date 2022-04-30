import { EventEmitter, Injectable } from '@angular/core';
import { Group, MathUtils, PerspectiveCamera, Scene, Vector3 } from 'three';
import { GameWheel } from '../models/game-wheel';
import { PiecePoints } from '../models/piece-points';
import {
  GRID_STEP_DEGREES,
  GRID_MAX_DEGREES,
  GRID_RADIUS,
  GRID_VERTICAL_OFFSET,
  WHEEL_START_POSITION,
} from '../game-constants';
import { MaterialManagerService } from './material/material-manager.service';
import { EffectsManagerService } from './effects-manager.service';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { TextManagerService } from './text/text-manager.service';
import { StarField } from '../models/star-field/star-field';
import { Subscription } from 'rxjs';
import { PowerMoveType } from '../models/power-move-type';
import { GamePiece } from '../models/game-piece/game-piece';

@Injectable()
export class ObjectManagerService {
  // create and store polar coordinates to draw game pieces
  private _piecePoints: PiecePoints[] = [];

  // store destination vertical (y axis) coordinates
  private _verticalTargets: number[] = [];

  private _axle: GameWheel[] = [];
  private _stack: Group;

  private _scene!: Scene;
  private _perspectiveCamera!: PerspectiveCamera;

  private _starField: StarField;

  private _powerMoveTextureSubscription!: Subscription;

  // events
  public LevelCompleted: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private materialManager: MaterialManagerService,
    private effectsManager: EffectsManagerService,
    private textManager: TextManagerService,
    private audioManager: AudioManagerService
  ) {
    this._stack = new Group();
    this._stack.name = 'gameWheelStack';
    this.initCoords();

    this._starField = new StarField();
  }

  get Axle(): GameWheel[] {
    return this._axle;
  }

  public SetCamera(camera: PerspectiveCamera): void {
    this._perspectiveCamera = camera;
  }

  public SetScene(scene: Scene): void {
    this._scene = scene;
    this._scene.add(this._stack);
    this._scene.add(this._starField);

    // initiate font download
    this.textManager.InitScene(this._scene);
  }

  public InitShapes(playableTextureCount: number): void {
    // clear existing objects
    this.dispose();

    // select colors for the current level
    const materials = this.materialManager.InitMaterials(playableTextureCount);

    // create all the objects
    this._verticalTargets.forEach(() => {
      const gameWheel = new GameWheel(WHEEL_START_POSITION, this._piecePoints, materials);
      this._axle.push(gameWheel);
      this._stack.add(gameWheel);
    });

    // assign iteration values (wheels are built bottom-up)
    this.assignIterationValues();

    // trigger intro animations
    this.effectsManager.AnimateLevelChangeAnimation(this._axle, this._verticalTargets, this._perspectiveCamera, true);

    this.audioManager.StopLevelComplete();
    this.audioManager.PlayLevelStart();
  }

  public AnimateLevelComplete(): void {
    this.effectsManager.AnimateLevelChangeAnimation(this._axle, this._verticalTargets, this._perspectiveCamera, false);
  }

  public InitStarField(): void {
    this._starField.InitParticles();
  }

  public UpdateStarField(): void {
    this._starField.UpdateParticles();
  }

  public GamePiecePowerMove(gamePiece: GamePiece, moveType: PowerMoveType): void {
    this._powerMoveTextureSubscription = this.materialManager
      .GetPowerMovePieceTexture(moveType)
      .subscribe((textureData) => {
        gamePiece.PowerMoveAdd(moveType, textureData);
        if (this._powerMoveTextureSubscription) {
          this._powerMoveTextureSubscription.unsubscribe();
        }
      });
  }

  public AnimatePowerMove(moveType: PowerMoveType): void {
    this.effectsManager.AnimatePowerMove(this._axle, moveType);
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
