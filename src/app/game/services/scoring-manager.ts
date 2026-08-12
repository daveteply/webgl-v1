import { Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { MathUtils } from 'three';
import {
  DIFFICULTY_TIER_3,
  LEVEL_ADDITIVE,
  LONG_MATCH_SCORE_MULTIPLIER,
  MINIMUM_MATCH_COUNT,
  MINIMUM_SPEED_BONUS,
  POWER_MOVE_USE_SCORE_MULTIPLIER,
  RAINBOW_COLOR_ARRAY,
} from '../game-constants';
import { LevelMaterialType } from '../level-material-type';
import { LevelStats } from '../models/level-stats';
import { PowerMoveType, PowerMoveLabel } from '../models/power-move-type';
import { GameEngineService } from './game-engine';
import { SaveGameScore } from './save-game/save-game-types';
import { TextManagerService } from '../text/services/text-manager';

@Injectable({
  providedIn: 'root',
})
export class ScoringManagerService {
  private textTextManager = inject(TextManagerService);
  private gameEngine = inject(GameEngineService);

  private _levelStats!: LevelStats;
  private _timeStart!: number;
  private _timeStop!: number;

  // events
  public MovesChange: Subject<boolean> = new Subject<boolean>();

  // Signals for template reactivity
  readonly level = signal<number>(1);
  get Level(): number {
    return this.level();
  }

  readonly score = signal<number>(0);
  get Score(): number {
    return this.score();
  }

  readonly levelPieceTarget = signal<number>(0);
  get LevelPieceTarget(): number {
    return this.levelPieceTarget();
  }

  readonly levelProgress = signal<number>(0);
  get LevelProgress(): number {
    return this.levelProgress();
  }

  readonly piecesRemaining = signal<number>(0);
  get PiecesRemaining(): number {
    return this.piecesRemaining();
  }

  readonly playerMoves = signal<number>(0);
  get PlayerMoves(): number {
    return this.playerMoves();
  }

  constructor() {
    this.ResetStats();
    this.initLevelPieceTarget();
  }

  get GameOver(): boolean {
    return this.playerMoves() === 0;
  }

  get LevelComplete(): boolean {
    return this.levelProgress() >= 100;
  }

  get LevelStats(): LevelStats {
    return this._levelStats;
  }

  public ResetTimer(): void {
    this._timeStart = performance.now();
  }
  public StopTimer(): void {
    this._timeStop = performance.now();
  }

  public IncLevel(): void {
    this.level.update((l) => l + 1);
  }

  public NextLevel(): void {
    this.initLevelPieceTarget();
    this.ResetStats();
  }

  public UpdateLevelProgress(): void {
    this._levelStats.pieceCount++;
    const progress = Math.min((this.LevelStats.pieceCount / this.levelPieceTarget()) * 100, 100);
    this.levelProgress.set(progress);

    const remaining = Math.max(this.levelPieceTarget() - this.LevelStats.pieceCount, 0);
    this.piecesRemaining.set(remaining);
  }

  public UpdateScore(pieceCount: number, endLevelSkip: boolean): void {
    // update since previous match
    const timeDiff = this._timeStop - this._timeStart;
    if (timeDiff < this._levelStats.fastestMatchTime) {
      this._levelStats.fastestMatchTime = Math.round(timeDiff);
    }

    let scoreDelta = 0;

    // level multiplier
    scoreDelta = pieceCount * this.level();

    // match speed multiplier
    const speedBonus = Math.ceil((1000 / timeDiff) * 1000);
    if (speedBonus >= MINIMUM_SPEED_BONUS) {
      this._levelStats.fastMatchBonusTotal += speedBonus;
      scoreDelta += speedBonus;

      // also earn move
      this._levelStats.moveCountEarned++;
      this.playerMoves.update((m) => m + 1);

      // splash text
      if (!endLevelSkip) {
        this.textTextManager.ShowText(['Speed Bonus', `+${speedBonus} Points`], this.textColor);
        this.MovesChange.next(true);
      }
    }

    // update score
    this.score.update((s) => s + scoreDelta);

    // long match multiplier
    if (pieceCount > MINIMUM_MATCH_COUNT) {
      this.longMatchBonus(pieceCount, endLevelSkip);
    }

    this.ResetTimer();
  }

  public UpdateMoveCount(): void {
    this._levelStats.moveCount++;
    this.playerMoves.update((m) => m - 1);
    this.MovesChange.next(false);
  }

  public UpdatePowerMoveBonus(additionalMoveCount: number, moveType?: PowerMoveType): void {
    let usePowerMoveBonus = this.level() * POWER_MOVE_USE_SCORE_MULTIPLIER;
    if (additionalMoveCount) {
      usePowerMoveBonus *= additionalMoveCount + 1;
    }
    this.score.update((s) => s + usePowerMoveBonus);

    const info = PowerMoveLabel.find((p) => p.type === moveType);
    const label = info?.label ? `${info.label}!` : additionalMoveCount ? 'Multi-Power!' : 'Power Move!';
    this.textTextManager.ShowText([`${label}`, `+${usePowerMoveBonus} Points`], this.textColor, true);
  }

  public RestartGame(): void {
    this.level.set(1);
    this.score.set(0);
    this.initLevelPieceTarget();
    this.ResetStats();
  }

  public ResetStats(restartLevel = false): void {
    if (this.playerMoves() === 0) {
      // reset moves for level restart
      const newMoves = this.level() < LONG_MATCH_SCORE_MULTIPLIER ? LEVEL_ADDITIVE : this.level();
      this.playerMoves.set(newMoves);
    }

    if (restartLevel) {
      this.score.set(0);
    }

    this.levelProgress.set(0);
    this._levelStats = {
      fastestMatchTime: Number.MAX_SAFE_INTEGER,
      fastMatchBonusTotal: 0,
      moveCount: 0,
      moveCountEarned: 0,
      pieceCount: 0,
    };

    this._timeStart = Date.now();
  }

  public StatsEntries(): number {
    let entryCount = 0;
    for (const value of Object.values(this._levelStats)) {
      if (value) {
        entryCount++;
      }
    }
    return entryCount;
  }

  public Restore(restoreScore?: SaveGameScore): void {
    if (restoreScore) {
      this.level.set(restoreScore.level);
      this.playerMoves.set(restoreScore.moves);
      this.piecesRemaining.set(restoreScore.remaining);
      this.levelProgress.set(restoreScore.progress);
      this.levelPieceTarget.set(restoreScore.pieceTarget);
      this.score.set(restoreScore.score);
      this._levelStats = restoreScore.stats;
    }
  }

  private longMatchBonus(pieceCount: number, endLevelSkip: boolean) {
    const longMatchMovesEarned = Math.ceil(MINIMUM_MATCH_COUNT * Math.log10(pieceCount - (MINIMUM_MATCH_COUNT - 1)));
    if (longMatchMovesEarned) {
      this.playerMoves.update((m) => m + longMatchMovesEarned);
      this._levelStats.moveCountEarned += longMatchMovesEarned;

      const longMatchBonus = longMatchMovesEarned * this.level() * LONG_MATCH_SCORE_MULTIPLIER;
      this.score.update((s) => s + longMatchBonus);

      if (!endLevelSkip) {
        this.textTextManager.ShowText(['Long Match', `+${longMatchBonus} Points`], this.textColor);
        this.MovesChange.next(true);
      }
    }
  }

  private initLevelPieceTarget(): void {
    let target = Math.ceil(Math.log2(this.level())) + this.level() + LEVEL_ADDITIVE;
    // cap the number of pieces
    if (target > DIFFICULTY_TIER_3) {
      target = DIFFICULTY_TIER_3;
    }
    this.levelPieceTarget.set(target);
    this.piecesRemaining.set(target);
  }

  private get textColor(): number | undefined {
    let targetColor = undefined;
    if (this.gameEngine.LevelMaterialType === LevelMaterialType.Emoji) {
      targetColor = RAINBOW_COLOR_ARRAY[MathUtils.randInt(0, RAINBOW_COLOR_ARRAY.length - 1)];
    }
    return targetColor;
  }
}

export { ScoringManagerService as ScoringManager };
