import { Injectable } from '@angular/core';
import { LEVEL_COMPLETION_MULTIPLIER } from '../game-constants';
import { LevelStats } from '../models/level-stats';

@Injectable()
export class ScoringManagerService {
  private _level: number = 1;
  private _levelPieceCount: number = 0;

  private _score: number = 0;

  private _timestamp: number;

  // level stats
  private _fastestMatchMs: number = Number.MAX_SAFE_INTEGER;
  private _moveCount: number = 0;

  constructor() {
    this._timestamp = Date.now();
  }

  get Level(): number {
    return this._level;
  }

  get Score(): number {
    return this._score;
  }

  get LevelProgress(): number {
    const foo =
      (this._levelPieceCount / (this._level * LEVEL_COMPLETION_MULTIPLIER)) *
      100;
    return foo;
  }

  get LevelStats(): LevelStats {
    return {
      fastestMatchMs: this._fastestMatchMs,
      moveCount: this._moveCount,
      pieceCount: this._levelPieceCount,
    };
  }

  public NextLevel(): void {
    this._level++;
    this._levelPieceCount = 0;
    this._moveCount = 0;
    this._timestamp = Date.now();
  }

  public UpdateScore(pieceCount: number): void {
    // update piece count
    this._levelPieceCount += pieceCount;

    // update since previous match
    const timeDiff = Date.now() - this._timestamp;
    if (timeDiff < this._fastestMatchMs) {
      this._fastestMatchMs = timeDiff;
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

  public TickMoveCount(): void {
    this._moveCount += 1;
  }
}
