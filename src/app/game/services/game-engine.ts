import { Injectable, inject, isDevMode } from '@angular/core';
import { PLAYABLE_TEXTURE_COUNT } from '../game-constants';
import { LevelGeometryType } from '../models/level-geometry-type';
import { LevelMaterialType } from '../models/level-material-type';
import { LevelOrientationType } from '../models/level-orientation-type';
import { GravityType } from '../models/gravity-type';
import { GamePiece } from '../models/game-piece/game-piece';
import { GameWheel } from '../models/game-wheel';
import { PowerMoveType } from '../models/power-move-type';
import { LevelTransitionType } from './level-transition-type';
import { PRNG } from '../../shared/utils/prng';
import { FeatureFlagsService } from './feature-flags/feature-flags.service';
import {
  calculateLevelConfiguration,
  calculateLevelTransitionType,
  evaluatePowerMove,
  findBombTargets,
  findAllMatches,
  findMatches,
  selectPowerMove,
} from '../engine';

@Injectable({
  providedIn: 'root',
})
export class GameEngineService {
  private featureFlags = inject(FeatureFlagsService);

  get PlayableTextureCount(): number {
    return PLAYABLE_TEXTURE_COUNT;
  }

  private _levelMaterialType!: LevelMaterialType;
  get LevelMaterialType(): LevelMaterialType {
    return this._levelMaterialType;
  }

  private _levelGeometryType: LevelGeometryType = LevelGeometryType.Cube;
  get LevelGeometryType(): LevelGeometryType {
    return this._levelGeometryType;
  }

  private _gravityType: GravityType = GravityType.None;
  get GravityType(): GravityType {
    return this._gravityType;
  }

  private _levelOrientation: LevelOrientationType = LevelOrientationType.Vertical;
  get LevelOrientation(): LevelOrientationType {
    return this._levelOrientation;
  }

  get IsHorizontal(): boolean {
    return this._levelOrientation !== LevelOrientationType.Vertical;
  }

  private _levelTransitionType: LevelTransitionType = LevelTransitionType.Default;
  get LevelTransitionType(): LevelTransitionType {
    return this._levelTransitionType;
  }

  public InitLevelTypes(level: number, rng?: PRNG): void {
    const config = calculateLevelConfiguration(level, rng ? () => rng.next() : Math.random, {
      geometryOverride: this.featureFlags.geometryOverride(),
      materialOverride: this.featureFlags.materialOverride(),
      gravityOverride: this.featureFlags.gravityOverride(),
      orientationOverride: this.featureFlags.orientationOverride(),
    });

    this._levelGeometryType = config.geometryType;
    this._levelMaterialType = config.materialType;
    this._gravityType = config.gravityType;
    this._levelOrientation = config.orientation;

    if (isDevMode()) {
      console.info('Level Material Type: ', LevelMaterialType[this._levelMaterialType]);
      console.info('Level Geometry Type: ', LevelGeometryType[this._levelGeometryType]);
      console.info('Level Gravity Type: ', this._gravityType);
      console.info('Level Orientation: ', LevelOrientationType[this._levelOrientation]);
    }
  }

  public RestoreLevelTypes(
    levelMaterialType: LevelMaterialType,
    levelGeometryType: LevelGeometryType,
    gravityType?: GravityType,
    levelOrientation?: LevelOrientationType,
  ): void {
    this._levelMaterialType = levelMaterialType;
    this._levelGeometryType = levelGeometryType;
    this._gravityType = gravityType ?? GravityType.None;
    this._levelOrientation = levelOrientation ?? LevelOrientationType.Vertical;
  }

  public InitLevelTransitionType(level?: number): void {
    this._levelTransitionType = calculateLevelTransitionType(level);
    if (isDevMode()) {
      console.info('Level Transition:', LevelTransitionType[this._levelTransitionType]);
    }
  }

  public PowerMoveSelection(level: number): PowerMoveType {
    const moveType = selectPowerMove(level, this.LevelGeometryType);
    if (isDevMode()) {
      console.info('    Power Move Type: ', PowerMoveType[moveType]);
    }
    return moveType;
  }

  public EvaluatePowerMove(matchCount: number, level: number): PowerMoveType {
    return evaluatePowerMove(matchCount, level, this.LevelGeometryType);
  }

  public FindBombTargets(bombPiece: GamePiece, axle: GameWheel[], level: number): GamePiece[] {
    const parentWheel = bombPiece.parent as GameWheel;
    const centerWheelIndex = axle.indexOf(parentWheel);
    return findBombTargets<GamePiece>(bombPiece, axle, centerWheelIndex, level);
  }

  public FindMatches(gamePiece: GamePiece, axle: GameWheel[]): GamePiece[] {
    for (const wheel of axle) {
      wheel.ResetIsMatch();
    }
    return findMatches<GamePiece>(gamePiece);
  }

  public FindAllMatches(axle: GameWheel[]): GamePiece[] {
    return findAllMatches<GamePiece>(axle);
  }
}
