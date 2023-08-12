import { EventEmitter, Injectable } from '@angular/core';

import { Observable, take } from 'rxjs';
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
import { LevelMaterialType } from '../level-material-type';

import { StarField } from '../models/star-field/star-field';

import { MaterialManagerService } from './material/material-manager.service';
import { EffectsManagerService } from './effects-manager.service';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { TextManagerService } from './text/text-manager.service';
import { GameEngineService } from './game-engine.service';
import { PostProcessingManagerService } from './post-processing-manager.service';
import { SaveGameService } from './save-game/save-game.service';

@Injectable({
  providedIn: 'root',
})
export class ObjectManagerService {
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
  public LevelChangeAnimationComplete: EventEmitter<void> = new EventEmitter();
  public LevelCompleted: EventEmitter<boolean> = new EventEmitter();
  public LevelMaterialsUpdated: EventEmitter<void> = new EventEmitter();

  constructor(
    private materialManager: MaterialManagerService,
    private effectsManager: EffectsManagerService,
    private textManager: TextManagerService,
    private audioManager: AudioManagerService,
    private gameEngine: GameEngineService,
    private postProcessingManager: PostProcessingManagerService,
    private saveGame: SaveGameService
  ) {
    this._stack = new Group();
    this._stack.name = 'gameWheelStack';
    this.initCoords();

    this._starField = new StarField();

    // need to re-broadcast from here to keep effects manager separate
    this.effectsManager.LevelChangeAnimation.subscribe((locked) => {
      if (!locked) {
        this.LevelChangeAnimationComplete.next();
        if (this.saveGame.IsRestoring) {
          this.RestorePositions();
        }
      }
    });
  }

  get Axle(): GameWheel[] {
    return this._axle;
  }

  public SetCamera(camera: PerspectiveCamera): void {
    this._perspectiveCamera = camera;
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
      for (let i = 0; i < this._verticalTargets.length; i++) {
        const gameWheel = new GameWheel(WHEEL_START_POSITION, this._piecePoints);
        this._axle.push(gameWheel);
        this._stack.add(gameWheel);
      }

      // initialize materials
      this.materialManager.InitMaterials(this._verticalTargets.length, this._piecePoints.length);

      // assign iteration values (wheels are built bottom-up)
      this.assignIterationValues();

      o.next();
      o.complete();
    });
  }

  public UpdateLevelMaterials(level: number): void {
    // update highlight color
    this.postProcessingManager.UpdateOutlinePassColor(
      RAINBOW_COLOR_ARRAY[MathUtils.randInt(0, RAINBOW_COLOR_ARRAY.length - 1)]
    );
    if (this.saveGame.IsRestoring) {
      this.postProcessingManager.UpdateOutlinePassColor(this.saveGame.SavedGameData.outlineColor as number);
    }

    // update materials in the material manager service
    this.materialManager.UpdateMaterials(
      this.saveGame.IsRestoring ? (this.saveGame.SavedGameData.scoring?.level as number) : level,
      this.gameEngine.PlayableTextureCount,
      this.gameEngine.LevelMaterialType
    );

    // update the properties and materials for the grid
    for (let i = 0; i < this._axle.length; i++) {
      const wheel = this._axle[i] as GameWheel;

      // reset properties for wheel and wheel's pieces
      wheel.Reset(this.gameEngine.LevelGeometryType);

      // apply the updated materials
      wheel.UpdateMaterials(this.materialManager.GameMaterials.wheelMaterials[i]);
    }

    this.LevelMaterialsUpdated.next();
  }

  public SaveGameState(): Observable<void> {
    return this.saveGame.SaveState(
      this.Axle,
      this.materialManager.LevelMaterials,
      this.materialManager.GameMaterials,
      this.gameEngine.LevelMaterialType,
      this.gameEngine.LevelGeometryType,
      this.effectsManager.SaveGameScoringData,
      this.postProcessingManager.OutlineColor
    );
  }

  public RestorePositions(): void {
    // wheel positions
    for (let i = 0; i < this.saveGame.SavedGameData.wheelData.length; i++) {
      const wheelData = this.saveGame.SavedGameData.wheelData[i];
      const wheel = this.Axle[i];
      if (wheel.Theta !== wheelData.theta) {
        wheel.AnimateHorizontalMotion(wheel.Theta, wheelData.theta, true);
      }

      // pieces
      for (let j = 0; j < wheel.children.length; j++) {
        const pieceData = wheelData.piecesData[j];
        const gamePiece = wheel.children[j] as GamePiece;
        // remove
        if (pieceData.isRemoved) {
          gamePiece.AnimateRemovalTween(0, true);
        }
        // flip
        if (pieceData.flipTurns !== gamePiece.FlipTurns) {
          gamePiece.AnimateFlipTween(Math.abs(pieceData.flipTurns), pieceData.flipTurns > 0, true);
        }
        // power move
        if (pieceData.powerMove) {
          // need to remove first
          gamePiece.AnimateRemovalTween(0, true);
          // restore power move
          this.GamePiecePowerMove(gamePiece, pieceData.powerMove, pieceData.powerMoveColor);
        }
      }
    }

    // message player
    let color = 0xffffff;
    if (this.saveGame.SavedGameData.levelMaterialType === LevelMaterialType.Emoji) {
      color = RAINBOW_COLOR_ARRAY[MathUtils.randInt(0, RAINBOW_COLOR_ARRAY.length - 1)];
    }
    this.textManager.ShowText(['Restored!'], color);

    // complete with restoration
    this.saveGame.RestoreComplete();
  }

  public NextLevel(level: number, updateMaterials = false): void {
    if (updateMaterials) {
      this.UpdateLevelMaterials(level);
    }
    // level transition
    this.postProcessingManager.UpdateLevelTransitionPass(this.gameEngine.LevelTransitionType, true);

    // trigger intro animations
    this.effectsManager.AnimateLevelChangeAnimation(
      this._axle,
      this._verticalTargets,
      this._perspectiveCamera,
      this._pointLight,
      true
    );

    // change audio
    this.audioManager.StopLevelComplete();
    this.audioManager.PlayLevelStart();
  }

  public AnimateLevelComplete(): void {
    // level transition
    this.postProcessingManager.UpdateLevelTransitionPass(this.gameEngine.LevelTransitionType, false);

    this.effectsManager.AnimateLevelChangeAnimation(
      this._axle,
      this._verticalTargets,
      this._perspectiveCamera,
      this._pointLight,
      false
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
    this.materialManager
      .GetPowerMovePieceTexture(moveType)
      .pipe(take(1))
      .subscribe((textureData) => {
        gamePiece.PowerMoveAdd(moveType, textureData, color);
      });
  }

  public AnimatePowerMove(moveType: PowerMoveType): void {
    this.effectsManager.AnimatePowerMove(this._axle, moveType);
  }

  public AdditivePowerMove(): void {
    this.effectsManager.AnimateAdditive(this._axle);
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
