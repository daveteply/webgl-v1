import { Injectable } from '@angular/core';
import { LEVEL_ADDITIVE } from '../game-constants';
import { LevelStats } from '../models/level-stats';

@Injectable()
export class ScoringManagerService {
  private _levelStats!: LevelStats;
  private _timestamp!: number;

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

  public NextLevel(): void {
    this._level++;
    this.initLevelPieceTarget();
    this.ResetStats();
  }

  public UpdateScore(pieceCount: number): void {
    // update piece count
    this._levelStats.pieceCount += pieceCount;
    this._levelProgress =
      (this.LevelStats.pieceCount / this._levelPieceTarget) * 100;

    // update since previous match
    const timeDiff = Date.now() - this._timestamp;
    if (timeDiff < this._levelStats.fastestMatchMs) {
      this._levelStats.fastestMatchMs = timeDiff;
    }

    let scoreDelta = 0;

    // level multiplier
    scoreDelta = pieceCount * this._level;

    // match speed multiplier
    const speedBonus = Math.ceil((1000 / timeDiff) * 1000);
    scoreDelta += speedBonus;

    // update score
    this._score += scoreDelta;

    // reset the clock
    this._timestamp = Date.now();
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
      moveCount: 0,
      pieceCount: 0,
    };

    this._timestamp = Date.now();
  }

  private initLevelPieceTarget(): void {
    this._levelPieceTarget =
      Math.ceil(Math.log2(this._level)) + this._level + LEVEL_ADDITIVE;
  }
}
