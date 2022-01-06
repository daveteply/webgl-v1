import { Injectable } from '@angular/core';
import { LEVEL_COMPLETION_MULTIPLIER } from '../game-constants';

@Injectable()
export class ScoringManagerService {
  private _level: number = 1;
  private _levelPieceCount: number = 0;

  private _score: number = 0;

  private _timestamp: number;

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

  public NextLevel(): void {
    this._level++;
    this._levelPieceCount = 0;
    this._timestamp = Date.now();
  }

  public UpdateScore(pieceCount: number): void {
    // update piece count
    this._levelPieceCount += pieceCount;

    // update since previous match
    const timeDiff = Date.now() - this._timestamp;
    this._timestamp = Date.now();

    let scoreDelta = 0;

    // level multiplier
    scoreDelta = pieceCount * this._level;

    // match speed multiplier
    // TODO

    this._score += scoreDelta;
  }
}
