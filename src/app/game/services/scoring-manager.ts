import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { MathUtils } from 'three';
import { RAINBOW_COLOR_ARRAY } from '../game-constants';
import { LevelMaterialType } from '../models/level-material-type';
import { LevelStats } from '../models/level-stats';
import { PowerMoveType, GetPowerMoveLabel } from '../models/power-move-type';
import { GameEngineService } from './game-engine';
import { TextManagerService } from '../text/services/text-manager';
import { GameStateStore } from '../state/game-state.store';

@Injectable({
  providedIn: 'root',
})
export class ScoringManagerService {
  private textManager = inject(TextManagerService);
  private gameEngine = inject(GameEngineService);
  private store = inject(GameStateStore);

  private _timeStart!: number;
  private _timeStop!: number;

  // events
  public MovesChange: Subject<boolean> = new Subject<boolean>();

  // Signals for template reactivity (delegated from GameStateStore)
  readonly level = this.store.level;
  get Level(): number {
    return this.level();
  }

  readonly score = this.store.score;
  get Score(): number {
    return this.score();
  }

  readonly levelPieceTarget = this.store.levelPieceTarget;
  get LevelPieceTarget(): number {
    return this.levelPieceTarget();
  }

  readonly levelProgress = this.store.levelProgress;
  get LevelProgress(): number {
    return this.levelProgress();
  }

  readonly piecesRemaining = this.store.piecesRemaining;
  get PiecesRemaining(): number {
    return this.piecesRemaining();
  }

  readonly playerMoves = this.store.movesRemaining;
  get PlayerMoves(): number {
    return this.playerMoves();
  }

  constructor() {
    this._timeStart = performance.now();
  }

  get GameOver(): boolean {
    return this.store.isGameOver();
  }

  get LevelComplete(): boolean {
    return this.store.isLevelComplete();
  }

  get LevelStats(): LevelStats {
    return this.store.levelStats();
  }

  public ResetTimer(): void {
    this._timeStart = performance.now();
  }

  public StopTimer(): void {
    this._timeStop = performance.now();
  }

  public IncLevel(): void {
    this.store.incrementLevel();
  }

  public NextLevel(): void {
    this.store.nextLevel();
  }

  public UpdateLevelProgress(): void {
    this.store.updateLevelProgress(1);
  }

  public UpdateScore(pieceCount: number, endLevelSkip: boolean): void {
    const timeDiff = this._timeStop - this._timeStart;
    const result = this.store.recordMatchScore(pieceCount, timeDiff);

    if (result.speedBonus && !endLevelSkip) {
      this.textManager.ShowText(['Speed Bonus', `+${result.speedBonus} Points`], this.textColor);
      this.MovesChange.next(true);
    }

    if (result.longMatchBonus && !endLevelSkip) {
      this.textManager.ShowText(['Long Match', `+${result.longMatchBonus} Points`], this.textColor);
      this.MovesChange.next(true);
    }

    this.ResetTimer();
  }

  public UpdateMoveCount(): void {
    this.store.decrementMoves();
    this.MovesChange.next(false);
  }

  public UpdatePowerMoveBonus(additionalMoveCount: number, moveType?: PowerMoveType): void {
    const usePowerMoveBonus = this.store.recordPowerMoveBonus(additionalMoveCount);

    if (additionalMoveCount > 0) {
      const moveText = additionalMoveCount === 1 ? '+1 Move' : `+${additionalMoveCount} Moves`;
      this.textManager.ShowText(['Multi-Power!', moveText, `+${usePowerMoveBonus} Points`], this.textColor, true);
      this.MovesChange.next(true);
    } else {
      const labelText = moveType ? GetPowerMoveLabel(moveType, this.gameEngine.LevelOrientation) : 'Power Move';
      this.textManager.ShowText([`${labelText}!`, `+${usePowerMoveBonus} Points`], this.textColor, true);
    }
  }

  public RestartGame(): void {
    this.store.restartGame();
  }

  public ResetStats(restartLevel = false): void {
    this.store.resetStats(restartLevel);
    this._timeStart = performance.now();
  }

  public CheckPerfectMatch(): boolean {
    const awarded = this.store.checkPerfectMatch();
    if (awarded) {
      const perfectBonus = this.store.levelStats().perfectMatchBonus;
      this.textManager.ShowText(['Perfect Match!', `+${perfectBonus} Points`], this.textColor, true);
      return true;
    }
    return false;
  }

  public StatsEntries(): number {
    const stats = this.store.levelStats();
    let entryCount = 0;
    if (stats.fastMatchBonusTotal > 0) {
      entryCount++;
      if (stats.fastestMatchTime < Number.MAX_SAFE_INTEGER) {
        entryCount++;
      }
    }
    if (stats.moveCount > 0) {
      entryCount++;
    }
    if (stats.moveCountEarned > 0) {
      entryCount++;
    }
    if (stats.pieceCount > 0) {
      entryCount++;
    }
    if (stats.perfectMatchBonus && stats.perfectMatchBonus > 0) {
      entryCount++;
    }
    return entryCount;
  }

  public StartSavedGame(level: number, score: number, moves: number): void {
    this.store.startSavedGame(level, score, moves);
  }

  private get textColor(): number | undefined {
    let targetColor = undefined;
    if (this.gameEngine.LevelMaterialType === LevelMaterialType.Emoji) {
      targetColor = RAINBOW_COLOR_ARRAY[MathUtils.randInt(0, RAINBOW_COLOR_ARRAY.length - 1)];
    }
    return targetColor;
  }
}
