import { Injectable } from '@angular/core';
import { LEVEL_COMPLETION_MULTIPLIER } from '../game-constants';
import { LevelStats } from '../models/level-stats';

@Injectable()
export class ScoringManagerService {
  private _level: number = 1;
  private _levelProgress: number = 0;
  private _score: number = 0;

  private _levelStats!: LevelStats;
  private _timestamp: number;

  private _playerMoves: number = 0;

  constructor() {
    this._timestamp = Date.now();
    this.resetStats();
  }

  get Level(): number {
    return this._level;
  }

  get Score(): number {
    return this._score;
  }

  get LevelProgress(): number {
    return this._levelProgress;
  }

  get LevelComplete(): boolean {
    return this.LevelProgress >= 100;
  }

  get LevelStats(): LevelStats {
    return this._levelStats;
  }

  public NextLevel(): void {
    this._level++;
    this.resetStats();
    this._timestamp = Date.now();
  }

  public UpdateScore(pieceCount: number): void {
    // update piece count
    this._levelStats.pieceCount += pieceCount;
    this._levelProgress =
      (this.LevelStats.pieceCount /
        (this._level * LEVEL_COMPLETION_MULTIPLIER)) *
      100;

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

  private resetStats(): void {
    this._levelProgress = 0;
    this._levelStats = {
      fastestMatchMs: 0,
      moveCount: 0,
      pieceCount: 0,
    };
  }
}
