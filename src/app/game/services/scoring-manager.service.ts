import { Injectable } from '@angular/core';
import {
  LEVEL_COMPLETION_MULTIPLIER,
  LEVEL_START_MOVE_MULTIPLIER,
} from '../game-constants';
import { LevelStats } from '../models/level-stats';

@Injectable()
export class ScoringManagerService {
  private _levelStats!: LevelStats;
  private _timestamp: number;

  constructor() {
    this._timestamp = Date.now();
    this.ResetStats();
  }

  private _level: number = 1;
  get Level(): number {
    return this._level;
  }

  private _score: number = 0;
  get Score(): number {
    return this._score;
  }

  private _levelProgress: number = 0;
  get LevelProgress(): number {
    return this._levelProgress;
  }

  private _playerMoves: number = 0;
  get PlayerMoves(): number {
    return this._playerMoves;
  }

  get LevelComplete(): boolean {
    return this.LevelProgress >= 100;
  }

  get LevelStats(): LevelStats {
    return this._levelStats;
  }

  public NextLevel(): void {
    this._level++;
    this.ResetStats();
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

  // controls end of game
  public UpdateMoveCount(): boolean {
    this._levelStats.moveCount++;
    this._playerMoves--;
    return this._playerMoves === 0;
  }

  public ResetStats(): void {
    // moves should start at zero:
    //  - at the start of the game
    //  - re-start of level if failed to complete
    if (this._playerMoves === 0) {
      this._playerMoves = this._level * LEVEL_START_MOVE_MULTIPLIER;
    }

    this._levelProgress = 0;
    this._levelStats = {
      fastestMatchMs: 0,
      moveCount: 0,
      pieceCount: 0,
    };
  }
}
