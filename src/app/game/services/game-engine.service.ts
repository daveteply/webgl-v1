import { Injectable } from '@angular/core';
import {
  DECIMAL_COMPARISON_TOLERANCE,
  MINIMUM_MATCH_COUNT,
} from '../game-constants';
import { GamePiece } from '../models/game-piece/game-piece';
import { GameWheel } from '../models/game-wheel';

// forcing strings in enum
enum Direction {
  Up = 'Up',
  Down = 'Down',
  Next = 'Next',
  Prev = 'Prev',
}

@Injectable()
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
    return this._matches.length >= MINIMUM_MATCH_COUNT ? this._matches : [];
  }

  private directionalSearch(gamePiece: GamePiece): void {
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

    if (gamePiece.Next.IsMatch || gamePiece.Next.IsRemoved) {
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

    if (gamePiece.Prev.IsMatch || gamePiece.Prev.IsRemoved) {
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

    const pieces = parentWheel.Above.children as GamePiece[];
    return pieces.find(
      (p) =>
        !p.IsMatch &&
        !p.IsRemoved &&
        p.MatchKey === gamePiece.MatchKey &&
        Math.abs(p.ThetaOffset - gamePiece.ThetaOffset) <
          DECIMAL_COMPARISON_TOLERANCE
    );
  }

  private matchBelow(gamePiece: GamePiece): GamePiece | undefined {
    const parentWheel = gamePiece.parent as GameWheel;
    if (!parentWheel.Below) {
      return undefined;
    }

    const pieces = parentWheel.Below.children as GamePiece[];
    return pieces.find(
      (p) =>
        !p.IsMatch &&
        !p.IsRemoved &&
        p.MatchKey === gamePiece.MatchKey &&
        Math.abs(p.ThetaOffset - gamePiece.ThetaOffset) <
          DECIMAL_COMPARISON_TOLERANCE
    );
  }
}
