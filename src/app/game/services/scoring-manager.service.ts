import { Injectable } from '@angular/core';
import {
  LEVEL_ADDITIVE,
  MINIMUM_MATCH_COUNT,
  MINIMUM_SPEED_BONUS,
} from '../game-constants';
import { LevelStats } from '../models/level-stats';

@Injectable()
export class ScoringManagerService {
  private _levelStats!: LevelStats;
  private _timeStart!: number;
  private _timeStop!: number;

  constructor() {
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

  public NextLevel(): void {
    this._level++;
    this.initLevelPieceTarget();
    this.ResetStats();
  }

  public UpdateLevelProgress(): void {
    this._levelStats.pieceCount++;
    this._levelProgress =
      (this.LevelStats.pieceCount / this._levelPieceTarget) * 100;
  }

  public UpdateScore(pieceCount: number): void {
    // update since previous match
    const timeDiff = this._timeStop - this._timeStart;
    if (timeDiff < this._levelStats.fastestMatchMs) {
      this._levelStats.fastestMatchMs = timeDiff;
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
    }

    // update score
    this._score += scoreDelta;

    // update move count
    const moveBonus = Math.floor(pieceCount / (MINIMUM_MATCH_COUNT + 1));
    if (moveBonus) {
      this._playerMoves += moveBonus;
      this._levelStats.moveCountEarned += moveBonus;
    }

    this.ResetTimer();
  }

  public UpdateMoveCount(): void {
    this._levelStats.moveCount++;
    this._playerMoves--;
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
      fastestMatchMs: Number.MAX_SAFE_INTEGER,
      fastMatchBonusTotal: 0,
      moveCount: 0,
      moveCountEarned: 0,
      pieceCount: 0,
    };

    this._timeStart = Date.now();
  }

  private initLevelPieceTarget(): void {
    this._levelPieceTarget =
      Math.ceil(Math.log2(this._level)) + this._level + LEVEL_ADDITIVE;
  }
}
