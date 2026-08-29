import { Injectable, computed, inject, signal } from '@angular/core';
import {
  DIFFICULTY_TIER_4,
  LEVEL_ADDITIVE,
  LONG_MATCH_SCORE_MULTIPLIER,
  MINIMUM_MATCH_COUNT,
  MINIMUM_SPEED_BONUS,
  MOVES_REMAINING_COUNT_DANGER,
  MOVES_REMAINING_COUNT_PANIC,
  MOVES_REMAINING_COUNT_WARNING,
  PERFECT_MATCH_SCORE_MULTIPLIER,
  POWER_MOVE_USE_SCORE_MULTIPLIER,
} from '../game-constants';
import { LevelGeometryType } from '../models/level-geometry-type';
import { LevelMaterialType } from '../models/level-material-type';
import { LevelOrientationType } from '../models/level-orientation-type';
import { GravityType } from '../models/gravity-type';
import { LevelStats } from '../models/level-stats';
import { LevelTransitionType } from '../services/level-transition-type';
import { FeatureFlagsService } from '../services/feature-flags/feature-flags.service';
import { PRNG } from '../../shared/utils/prng';
import { calculateLevelConfiguration, calculateLevelTransitionType } from '../engine';
import { GameStatus } from './game-status';

function createInitialLevelStats(): LevelStats {
  return {
    fastestMatchTime: Number.MAX_SAFE_INTEGER,
    fastMatchBonusTotal: 0,
    moveCount: 0,
    moveCountEarned: 0,
    pieceCount: 0,
    perfectMatchBonus: 0,
  };
}

export interface MatchScoreResult {
  scoreDelta: number;
  speedBonus: number;
  longMatchBonus: number;
  earnedMoves: number;
}

@Injectable({
  providedIn: 'root',
})
export class GameStateStore {
  private featureFlags = inject(FeatureFlagsService);

  // Core Game State Signals
  readonly level = signal<number>(1);
  readonly score = signal<number>(0);
  readonly movesRemaining = signal<number>(LEVEL_ADDITIVE);
  readonly levelProgress = signal<number>(0);
  readonly levelPieceTarget = signal<number>(0);
  readonly piecesRemaining = signal<number>(0);
  readonly levelStats = signal<LevelStats>(createInitialLevelStats());
  readonly gameStatus = signal<GameStatus>('idle');

  // Level Configuration Signals
  readonly levelGeometryType = signal<LevelGeometryType>(LevelGeometryType.Cube);
  readonly levelMaterialType = signal<LevelMaterialType>(LevelMaterialType.ColorBumpShape);
  readonly gravityType = signal<GravityType>(GravityType.None);
  readonly levelOrientation = signal<LevelOrientationType>(LevelOrientationType.Vertical);
  readonly levelTransitionType = signal<LevelTransitionType>(LevelTransitionType.Default);

  // Computed Signals
  readonly isHorizontal = computed<boolean>(() => this.levelOrientation() !== LevelOrientationType.Vertical);
  readonly isGameOver = computed<boolean>(() => this.movesRemaining() <= 0 && this.gameStatus() !== 'level-complete');
  readonly isLevelComplete = computed<boolean>(() => this.levelProgress() >= 100);

  readonly isWarningMoves = computed<boolean>(() => this.movesRemaining() === MOVES_REMAINING_COUNT_WARNING);
  readonly isDangerMoves = computed<boolean>(() => this.movesRemaining() === MOVES_REMAINING_COUNT_DANGER);
  readonly isPanicMoves = computed<boolean>(() => this.movesRemaining() === MOVES_REMAINING_COUNT_PANIC);

  readonly movesStatus = computed<'normal' | 'warn' | 'danger' | 'panic'>(() => {
    const m = this.movesRemaining();
    if (m === MOVES_REMAINING_COUNT_PANIC) return 'panic';
    if (m === MOVES_REMAINING_COUNT_DANGER) return 'danger';
    if (m === MOVES_REMAINING_COUNT_WARNING) return 'warn';
    return 'normal';
  });

  constructor() {
    this.calculateLevelPieceTarget();
    this.resetStats();
  }

  // State Modification Actions
  public setGameStatus(status: GameStatus): void {
    this.gameStatus.set(status);
  }

  public initLevelConfig(level: number, rng?: PRNG): void {
    this.level.set(level);

    const config = calculateLevelConfiguration(level, rng ? () => rng.next() : Math.random, {
      geometryOverride: this.featureFlags.geometryOverride(),
      materialOverride: this.featureFlags.materialOverride(),
      gravityOverride: this.featureFlags.gravityOverride(),
      orientationOverride: this.featureFlags.orientationOverride(),
    });

    this.levelGeometryType.set(config.geometryType);
    this.levelMaterialType.set(config.materialType);
    this.gravityType.set(config.gravityType);
    this.levelOrientation.set(config.orientation);
    this.levelTransitionType.set(calculateLevelTransitionType(level));
  }

  public initLevel(level: number, rng?: PRNG): void {
    this.initLevelConfig(level, rng);
    this.calculateLevelPieceTarget();
    this.resetStats();
    this.setGameStatus('playing');
  }

  public restoreLevel(
    material: LevelMaterialType,
    geometry: LevelGeometryType,
    gravity?: GravityType,
    orientation?: LevelOrientationType,
  ): void {
    this.levelMaterialType.set(material);
    this.levelGeometryType.set(geometry);
    this.gravityType.set(gravity ?? GravityType.None);
    this.levelOrientation.set(orientation ?? LevelOrientationType.Vertical);
  }

  public startSavedGame(level: number, score: number, moves: number): void {
    this.level.set(level);
    this.score.set(score);
    this.movesRemaining.set(moves > 0 ? moves : LEVEL_ADDITIVE);
    this.calculateLevelPieceTarget();
    this.resetStats();
    if (moves > 0) {
      this.movesRemaining.set(moves);
    }
    this.setGameStatus('playing');
  }

  public restartGame(): void {
    this.level.set(1);
    this.score.set(0);
    this.movesRemaining.set(LEVEL_ADDITIVE);
    this.calculateLevelPieceTarget();
    this.resetStats(true);
    this.setGameStatus('playing');
  }

  public nextLevel(): void {
    this.calculateLevelPieceTarget();
    this.resetStats();
    this.setGameStatus('playing');
  }

  public incrementLevel(): void {
    this.level.update((l) => l + 1);
  }

  public decrementMoves(): void {
    const currentStats = { ...this.levelStats() };
    currentStats.moveCount++;
    this.levelStats.set(currentStats);

    this.movesRemaining.update((m) => Math.max(0, m - 1));
    if (this.movesRemaining() === 0 && !this.isLevelComplete()) {
      this.setGameStatus('game-over');
    }
  }

  public addEarnedMoves(count: number): void {
    if (count <= 0) return;
    const currentStats = { ...this.levelStats() };
    currentStats.moveCountEarned += count;
    this.levelStats.set(currentStats);
    this.movesRemaining.update((m) => m + count);
  }

  public addScore(points: number): void {
    this.score.update((s) => s + points);
  }

  public updateLevelProgress(matchedPieceCount = 1): void {
    const currentStats = { ...this.levelStats() };
    currentStats.pieceCount += matchedPieceCount;
    this.levelStats.set(currentStats);

    const target = this.levelPieceTarget();
    const progress = Math.min((currentStats.pieceCount / target) * 100, 100);
    this.levelProgress.set(progress);

    const remaining = Math.max(target - currentStats.pieceCount, 0);
    this.piecesRemaining.set(remaining);

    if (progress >= 100) {
      this.setGameStatus('level-complete');
    }
  }

  public recordMatchScore(pieceCount: number, timeDiffMs: number): MatchScoreResult {
    const currentStats = { ...this.levelStats() };

    if (timeDiffMs < currentStats.fastestMatchTime) {
      currentStats.fastestMatchTime = Math.round(timeDiffMs);
    }

    let scoreDelta = pieceCount * this.level();
    let speedBonus = 0;
    let earnedMoves = 0;

    // Speed bonus
    if (timeDiffMs > 0) {
      const calculatedSpeedBonus = Math.ceil((1000 / timeDiffMs) * 1000);
      if (calculatedSpeedBonus >= MINIMUM_SPEED_BONUS) {
        speedBonus = calculatedSpeedBonus;
        currentStats.fastMatchBonusTotal += speedBonus;
        scoreDelta += speedBonus;
        earnedMoves += 1;
      }
    }

    // Long match bonus
    let longMatchBonus = 0;
    if (pieceCount > MINIMUM_MATCH_COUNT) {
      const longMatchMovesEarned = Math.ceil(MINIMUM_MATCH_COUNT * Math.log10(pieceCount - (MINIMUM_MATCH_COUNT - 1)));
      if (longMatchMovesEarned > 0) {
        earnedMoves += longMatchMovesEarned;
        longMatchBonus = longMatchMovesEarned * this.level() * LONG_MATCH_SCORE_MULTIPLIER;
        scoreDelta += longMatchBonus;
      }
    }

    currentStats.moveCountEarned += earnedMoves;
    this.levelStats.set(currentStats);

    if (earnedMoves > 0) {
      this.movesRemaining.update((m) => m + earnedMoves);
    }
    this.score.update((s) => s + scoreDelta);

    return {
      scoreDelta,
      speedBonus,
      longMatchBonus,
      earnedMoves,
    };
  }

  public recordPowerMoveBonus(additionalMoveCount: number): number {
    let bonus = this.level() * POWER_MOVE_USE_SCORE_MULTIPLIER;
    if (additionalMoveCount > 0) {
      bonus *= additionalMoveCount + 1;
      this.addEarnedMoves(additionalMoveCount);
    }
    this.addScore(bonus);
    return bonus;
  }

  public checkPerfectMatch(): boolean {
    const currentStats = { ...this.levelStats() };
    if (
      this.isLevelComplete() &&
      currentStats.pieceCount === this.levelPieceTarget() &&
      !currentStats.perfectMatchBonus
    ) {
      const perfectBonus = this.level() * PERFECT_MATCH_SCORE_MULTIPLIER;
      currentStats.perfectMatchBonus = perfectBonus;
      this.levelStats.set(currentStats);
      this.addScore(perfectBonus);
      return true;
    }
    return false;
  }

  public resetStats(restartLevel = false): void {
    if (restartLevel || this.movesRemaining() === 0) {
      const newMoves = this.level() < LONG_MATCH_SCORE_MULTIPLIER ? LEVEL_ADDITIVE : this.level();
      this.movesRemaining.set(newMoves);
    }

    if (restartLevel) {
      this.score.set(0);
    }

    this.levelProgress.set(0);
    this.piecesRemaining.set(this.levelPieceTarget());
    this.levelStats.set(createInitialLevelStats());
  }

  private calculateLevelPieceTarget(): void {
    let target = Math.ceil(Math.log2(this.level())) + this.level() + LEVEL_ADDITIVE;
    if (target > DIFFICULTY_TIER_4) {
      target = DIFFICULTY_TIER_4;
    }
    this.levelPieceTarget.set(target);
    this.piecesRemaining.set(target);
  }
}
