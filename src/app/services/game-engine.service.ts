import { Injectable } from '@angular/core';
import {
  DECIMAL_COMPARISON_TOLERANCE,
  MINIMUM_MATCH_COUNT,
} from '../game-constants';
import { GamePiece } from '../models/game-piece';
import { GameWheel } from '../models/game-wheel';

// forcing strings in enum
enum Direction {
  Up = 'Up',
  Down = 'Down',
  Next = 'Next',
  Prev = 'Prev',
}

@Injectable({
  providedIn: 'root',
})
export class GameEngineService {
  // reset matches
  private _matches: GamePiece[] = [];

  constructor() {}

  public FindMatches(gamePiece: GamePiece, axle: GameWheel[]): GamePiece[] {
    // reset all game piece isMatch
    for (const wheel of axle) {
      wheel.ResetIsMatch();
    }

    // set isMatch for initial piece
    gamePiece.IsMatch = true;

    // reset all existing matches and start with the initial piece
    this._matches = [gamePiece];

    // begin recursive search
    this.directionalSearch(gamePiece);

    // all matches should be complete
    console.log(
      this._matches.map((m) => m.id),
      this._matches[0].MatchKey
    );

    return this._matches.length >= MINIMUM_MATCH_COUNT ? this._matches : [];
  }

  private directionalSearch(gamePiece: GamePiece): void {
    if (gamePiece.IsRemoved) {
      return;
    }

    let match: GamePiece | undefined;

    for (const direction in Direction) {
      match = undefined;
      switch (direction) {
        case Direction.Next:
          match = this.matchNext(gamePiece);
          break;
        case Direction.Prev:
          match = this.matchPrev(gamePiece);
          break;
        case Direction.Up:
          match = this.matchAbove(gamePiece);
          break;
        case Direction.Down:
          match = this.matchBelow(gamePiece);
          break;
        default:
      }

      if (match) {
        match.IsMatch = true;
        this._matches.push(match);
        this.directionalSearch(match);
      }
    }
  }

  private matchNext(gamePiece: GamePiece): GamePiece | undefined {
    // TODO: stop conditions
    //  if the next piece is not in the frustum

    if (gamePiece.Next.IsMatch) {
      return undefined;
    }

    if (gamePiece.Next.MatchKey === gamePiece.MatchKey) {
      return gamePiece.Next;
    }

    return undefined;
  }

  private matchPrev(gamePiece: GamePiece): GamePiece | undefined {
    // TODO: stop conditions
    //  if the prev piece is not in the frustum

    if (gamePiece.Prev.IsMatch) {
      return undefined;
    }

    if (gamePiece.Prev.MatchKey === gamePiece.MatchKey) {
      return gamePiece.Prev;
    }

    return undefined;
  }

  private matchAbove(gamePiece: GamePiece): GamePiece | undefined {
    const parentWheel = gamePiece.parent as GameWheel;
    if (!parentWheel.Above) {
      return undefined;
    }

    for (const aboveGamePiece of parentWheel.Above.children as GamePiece[]) {
      if (
        !aboveGamePiece.IsMatch &&
        // good 'ole decimal comparison in JavaScript :P
        Math.abs(aboveGamePiece.ThetaOffset - gamePiece.ThetaOffset) <
          DECIMAL_COMPARISON_TOLERANCE &&
        aboveGamePiece.MatchKey === gamePiece.MatchKey
      ) {
        return aboveGamePiece;
      }
    }

    return undefined;
  }

  private matchBelow(gamePiece: GamePiece): GamePiece | undefined {
    const parentWheel = gamePiece.parent as GameWheel;
    if (!parentWheel.Below) {
      return undefined;
    }

    for (const belowGamePiece of parentWheel.Below.children as GamePiece[]) {
      if (
        !belowGamePiece.IsMatch &&
        // good 'ole decimal comparison in JavaScript :P
        Math.abs(belowGamePiece.ThetaOffset - gamePiece.ThetaOffset) <
          DECIMAL_COMPARISON_TOLERANCE &&
        belowGamePiece.MatchKey === gamePiece.MatchKey
      ) {
        return belowGamePiece;
      }
    }

    return undefined;
  }
}
