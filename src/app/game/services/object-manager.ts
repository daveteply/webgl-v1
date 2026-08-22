import { Injectable, inject } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Group, MathUtils, PerspectiveCamera, PointLight, Scene, Vector3 } from 'three';

import { GameWheel } from '../models/game-wheel';
import { PiecePoints } from '../models/piece-points';
import { GamePiece } from '../models/game-piece/game-piece';
import {
  GRID_STEP_DEGREES,
  GRID_MAX_DEGREES,
  GRID_RADIUS,
  GRID_VERTICAL_OFFSET,
  WHEEL_START_POSITION,
  RAINBOW_COLOR_ARRAY,
} from '../game-constants';
import { PowerMoveType } from '../models/power-move-type';

import { StarField } from '../models/star-field';

import { MaterialManagerService } from '../services/material/material-manager';
import { EffectsManagerService } from './effects-manager';
import { AudioManagerService } from '../../shared/services/audio/audio-manager';
import { TextManagerService } from '../text/services/text-manager';
import { GameEngineService } from './game-engine';
import { PostProcessingManagerService } from './post-processing-manager';
import { PRNG } from '../../shared/utils/prng';

@Injectable({
  providedIn: 'root',
})
export class ObjectManagerService {
  private materialManager = inject(MaterialManagerService);
  private effectsManager = inject(EffectsManagerService);
  private textManager = inject(TextManagerService);
  private audioManager = inject(AudioManagerService);
  private gameEngine = inject(GameEngineService);
  private postProcessingManager = inject(PostProcessingManagerService);

  // create and store polar coordinates to draw game pieces
  private _piecePoints: PiecePoints[] = [];

  // store destination vertical (y axis) coordinates
  private _verticalTargets: number[] = [];

  private _axle: GameWheel[] = [];
  private _stack: Group;

  private _scene!: Scene;
  private _perspectiveCamera!: PerspectiveCamera;
  private _pointLight!: PointLight;

  private _starField: StarField;

  // events
  public LevelChangeAnimationComplete: Subject<void> = new Subject<void>();
  public LevelCompleted: Subject<boolean> = new Subject<boolean>();
  public LevelMaterialsUpdated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    this._stack = new Group();
    this._stack.name = 'gameWheelStack';
    this.initCoords();

    this._starField = new StarField();

    // need to re-broadcast from here to keep effects manager separate
    this.effectsManager.LevelChangeAnimation.subscribe((locked) => {
      if (!locked) {
        this.LevelChangeAnimationComplete.next();
      }
    });
  }

  get Axle(): GameWheel[] {
    return this._axle;
  }

  public SetCamera(camera: PerspectiveCamera): void {
    this._perspectiveCamera = camera;
    this.textManager.SetCamera(camera);
  }

  public SetLight(light: PointLight): void {
    this._pointLight = light;
  }

  public SetScene(scene: Scene): void {
    this._scene = scene;
    this._scene.add(this._stack);
    this._scene.add(this._starField);

    // initiate font download
    this.textManager.InitScene(this._scene);
  }

  // called once in the beginning of the application load
  public InitShapes(): Observable<void> {
    return new Observable((o) => {
      // create wheels, wheels will create game pieces
      this._verticalTargets.forEach(() => {
        const gameWheel = new GameWheel(WHEEL_START_POSITION, this._piecePoints);
        this._axle.push(gameWheel);
        this._stack.add(gameWheel);
      });

      // initialize materials
      this.materialManager.InitMaterials(this._verticalTargets.length, this._piecePoints.length);

      // assign iteration values (wheels are built bottom-up)
      this.assignIterationValues();

      o.next();
      o.complete();
    });
  }

  public UpdateLevelMaterials(level: number, rng?: PRNG): void {
    // update highlight color
    const highlightInx = rng
      ? rng.nextInt(0, RAINBOW_COLOR_ARRAY.length - 1)
      : MathUtils.randInt(0, RAINBOW_COLOR_ARRAY.length - 1);
    this.postProcessingManager.UpdateOutlinePassColor(RAINBOW_COLOR_ARRAY[highlightInx]);

    // update materials in the material manager service
    this.materialManager.UpdateMaterials(
      level,
      this.gameEngine.PlayableTextureCount,
      this.gameEngine.LevelMaterialType,
      rng,
    );

    // update the properties and materials for the grid
    for (let i = 0; i < this._axle.length; i++) {
      const wheel = this._axle[i] as GameWheel;

      // reset properties for wheel and wheel's pieces
      wheel.Reset(this.gameEngine.LevelGeometryType);

      // apply the updated materials
      wheel.UpdateMaterials(this.materialManager.GameMaterials.wheelMaterials[i]);
    }

    this.LevelMaterialsUpdated.next(true);
  }

  public NextLevel(level: number, updateMaterials = false, rng?: PRNG): void {
    if (updateMaterials) {
      this.UpdateLevelMaterials(level, rng);
    }
    // level transition
    this.postProcessingManager.UpdateLevelTransitionPass(this.gameEngine.LevelTransitionType, true);

    // trigger intro animations
    this.effectsManager.AnimateLevelChangeAnimation(
      this._axle,
      this._verticalTargets,
      this._perspectiveCamera,
      this._pointLight,
      true,
      undefined,
      this.gameEngine.LevelOrientation,
    );

    // change audio
    this.audioManager.StopLevelComplete();
    this.audioManager.PlayLevelStart();
  }

  public ResetIsMatch(): void {
    this._axle.forEach((wheel) => wheel.ResetIsMatch());
  }

  public AnimateLevelComplete(): void {
    // level transition
    this.postProcessingManager.UpdateLevelTransitionPass(this.gameEngine.LevelTransitionType, false);

    this.effectsManager.AnimateLevelChangeAnimation(
      this._axle,
      this._verticalTargets,
      this._perspectiveCamera,
      this._pointLight,
      false,
      undefined,
      this.gameEngine.LevelOrientation,
    );
  }

  public InitStarField(): void {
    this._starField.InitParticles();
  }

  public UpdateStarField(): void {
    this._starField.UpdateParticles();
  }

  public UpdateStarFieldColor(color: number): void {
    this._starField.UpdateColor(color);
  }

  public GamePiecePowerMove(gamePiece: GamePiece, moveType: PowerMoveType, color?: number): void {
    gamePiece.PowerMoveAdd(moveType, color);
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
}

export { ObjectManagerService as ObjectManager };
