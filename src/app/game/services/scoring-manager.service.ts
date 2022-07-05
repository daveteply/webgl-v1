import { EventEmitter, Injectable } from '@angular/core';
import {
  LEVEL_ADDITIVE,
  LONG_MATCH_SCORE_MULTIPLIER,
  MINIMUM_MATCH_COUNT,
  MINIMUM_SPEED_BONUS,
  POWER_MOVE_USE_SCORE_MULTIPLIER,
} from '../game-constants';
import { LevelStats } from '../models/level-stats';
import { TextManagerService } from './text/text-manager.service';

@Injectable()
export class ScoringManagerService {
  private _levelStats!: LevelStats;
  private _timeStart!: number;
  private _timeStop!: number;

  // events
  public MovesChange: EventEmitter<boolean> = new EventEmitter();

  constructor(private textTextManager: TextManagerService) {
    this.ResetStats();
    this.initLevelPieceTarget();
  }

  private _level: number = 1;
  get Level(): number {
    return this._level;
  }

  private _score: number = 0;
  get Score(): number {
    return this._score;
  }

  private _levelPieceTarget: number = 0;
  get LevelPieceTarget(): number {
    return this._levelPieceTarget;
  }

  private _levelProgress: number = 0;
  get LevelProgress(): number {
    return this._levelProgress;
  }

  private _piecesRemaining: number = 0;
  get PiecesRemaining(): number {
    return this._piecesRemaining;
  }

  private _playerMoves: number = 0;
  get PlayerMoves(): number {
    return this._playerMoves;
  }
  get GameOver(): boolean {
    return this._playerMoves === 0;
  }

  get LevelComplete(): boolean {
    return this.LevelProgress >= 100;
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
    this._level++;
  }

  public NextLevel(): void {
    this.initLevelPieceTarget();
    this.ResetStats();
  }

  public UpdateLevelProgress(): void {
    this._levelStats.pieceCount++;
    this._levelProgress = (this.LevelStats.pieceCount / this._levelPieceTarget) * 100;
    if (this._levelProgress > 100) {
      this._levelProgress = 100;
    }

    this._piecesRemaining = this._levelPieceTarget - this.LevelStats.pieceCount;
    if (this._piecesRemaining < 0) {
      this._piecesRemaining = 0;
    }
  }

  public UpdateScore(pieceCount: number, endLevelSkip: boolean): void {
    // update since previous match
    const timeDiff = this._timeStop - this._timeStart;
    if (timeDiff < this._levelStats.fastestMatchTime) {
      this._levelStats.fastestMatchTime = Math.round(timeDiff);
    }

    let scoreDelta = 0;

    // level multiplier
    scoreDelta = pieceCount * this._level;

    // match speed multiplier
    const speedBonus = Math.ceil((1000 / timeDiff) * 1000);
    if (speedBonus >= MINIMUM_SPEED_BONUS) {
      this._levelStats.fastMatchBonusTotal += speedBonus;
      scoreDelta += speedBonus;

      // also earn move
      this._levelStats.moveCountEarned++;
      this._playerMoves++;

      // splash text
      if (!endLevelSkip) {
        this.textTextManager.ShowText(['Speed Bonus', `+${speedBonus} Points`]);
        this.MovesChange.next(true);
      }
    }

    // update score
    this._score += scoreDelta;

    // long match multiplier
    if (pieceCount > MINIMUM_MATCH_COUNT) {
      this.longMatchBonus(pieceCount, endLevelSkip);
    }

    this.ResetTimer();
  }

  public UpdateMoveCount(): void {
    this._levelStats.moveCount++;
    this._playerMoves--;
    this.MovesChange.next(false);
  }

  public UpdatePowerMoveBonus(additionalMoveCount: number): void {
    let usePowerMoveBonus = this._level * POWER_MOVE_USE_SCORE_MULTIPLIER;
    if (additionalMoveCount) {
      usePowerMoveBonus *= additionalMoveCount + 1;
    }
    this._score += usePowerMoveBonus;
    const multiMove = additionalMoveCount ? 'Multi-Power!' : 'Power Move!';
    this.textTextManager.ShowText([`${multiMove}`, `+${usePowerMoveBonus} Points`]);
  }

  public RestartGame(): void {
    this._level = 1;
    this._score = 0;
    this._playerMoves = 0;
    this.initLevelPieceTarget();
    this.ResetStats();
  }

  public ResetStats(restartLevel: boolean = false): void {
    if (this.PlayerMoves === 0) {
      // reset moves for level restart
      this._playerMoves = LEVEL_ADDITIVE;
    }

    if (restartLevel) {
      this._score = 0;
    }

    this._levelProgress = 0;
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

  private longMatchBonus(pieceCount: number, endLevelSkip: boolean) {
    const longMatchMovesEarned = Math.ceil(MINIMUM_MATCH_COUNT * Math.log10(pieceCount - (MINIMUM_MATCH_COUNT - 1)));
    if (longMatchMovesEarned) {
      this._playerMoves += longMatchMovesEarned;
      this._levelStats.moveCountEarned += longMatchMovesEarned;

      const longMatchBonus = longMatchMovesEarned * this._level * LONG_MATCH_SCORE_MULTIPLIER;
      this._score += longMatchBonus;

      if (!endLevelSkip) {
        this.textTextManager.ShowText(['Long Match', `+${longMatchBonus} Points`]);
        this.MovesChange.next(true);
      }
    }
  }

  private initLevelPieceTarget(): void {
    this._levelPieceTarget = Math.ceil(Math.log2(this._level)) + this._level + LEVEL_ADDITIVE;

    this._piecesRemaining = this._levelPieceTarget;
  }
}
