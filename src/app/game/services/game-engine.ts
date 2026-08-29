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
import { GameStateStore } from '../state/game-state.store';
import {
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
  private store = inject(GameStateStore);

  get PlayableTextureCount(): number {
    return PLAYABLE_TEXTURE_COUNT;
  }

  // Reactive signals delegated from GameStateStore
  readonly levelMaterialType = this.store.levelMaterialType;
  get LevelMaterialType(): LevelMaterialType {
    return this.levelMaterialType();
  }

  readonly levelGeometryType = this.store.levelGeometryType;
  get LevelGeometryType(): LevelGeometryType {
    return this.levelGeometryType();
  }

  readonly gravityType = this.store.gravityType;
  get GravityType(): GravityType {
    return this.gravityType();
  }

  readonly levelOrientation = this.store.levelOrientation;
  get LevelOrientation(): LevelOrientationType {
    return this.levelOrientation();
  }

  readonly isHorizontal = this.store.isHorizontal;
  get IsHorizontal(): boolean {
    return this.isHorizontal();
  }

  readonly levelTransitionType = this.store.levelTransitionType;
  get LevelTransitionType(): LevelTransitionType {
    return this.levelTransitionType();
  }

  public InitLevelTypes(level: number, rng?: PRNG): void {
    this.store.initLevelConfig(level, rng);

    if (isDevMode()) {
      console.info('Level Material Type: ', LevelMaterialType[this.LevelMaterialType]);
      console.info('Level Geometry Type: ', LevelGeometryType[this.LevelGeometryType]);
      console.info('Level Gravity Type: ', this.GravityType);
      console.info('Level Orientation: ', LevelOrientationType[this.LevelOrientation]);
    }
  }

  public RestoreLevelTypes(
    levelMaterialType: LevelMaterialType,
    levelGeometryType: LevelGeometryType,
    gravityType?: GravityType,
    levelOrientation?: LevelOrientationType,
  ): void {
    this.store.restoreLevel(levelMaterialType, levelGeometryType, gravityType, levelOrientation);
  }

  public InitLevelTransitionType(level?: number): void {
    const transitionType = calculateLevelTransitionType(level);
    this.store.levelTransitionType.set(transitionType);
    if (isDevMode()) {
      console.info('Level Transition:', LevelTransitionType[transitionType]);
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
