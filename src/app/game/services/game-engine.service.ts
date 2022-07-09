import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DECIMAL_COMPARISON_TOLERANCE, DEFAULT_PLAYABLE_TEXTURE_COUNT, DIFFICULT_LEVEL_COLOR } from '../game-constants';
import { LevelGeometryType } from '../level-geometry-type';
import { LevelMaterialType } from '../level-material-type';
import { GamePiece } from '../models/game-piece/game-piece';
import { GameWheel } from '../models/game-wheel';
import { PowerMoveType } from '../models/power-move-type';

// forcing strings in enum
enum SearchDirection {
  Up = 'Up',
  Down = 'Down',
  Next = 'Next',
  Prev = 'Prev',
}

@Injectable()
export class GameEngineService {
  private _matches: GamePiece[] = [];

  private _playableTextureCount: number = DEFAULT_PLAYABLE_TEXTURE_COUNT;
  get PlayableTextureCount(): number {
    return this._playableTextureCount;
  }

  private _playableTextureCountColor: number = DIFFICULT_LEVEL_COLOR[0];
  get PlayableTextureCountColor(): number {
    return this._playableTextureCountColor;
  }

  private _levelMaterialType!: LevelMaterialType;
  get LevelMaterialType(): LevelMaterialType {
    return this._levelMaterialType;
  }

  private _levelGeometryType: LevelGeometryType = LevelGeometryType.Cube;
  get LevelGeometryType(): LevelGeometryType {
    return this._levelGeometryType;
  }

  public InitLevelTypes(): void {
    // set level material type
    this._levelMaterialType = Math.floor(Math.random() * 3) + 1;
    if (!environment.production) {
      console.info('Level Material Type: ', LevelMaterialType[this._levelMaterialType]);
    }

    // default geometry type
    this._levelGeometryType = LevelGeometryType.Cube;
    if (Math.floor(Math.random() * 2) % 2 === 0) {
      this._levelGeometryType = LevelGeometryType.Cylinder;
    }

    if (!environment.production) {
      console.info('Level Geometry Type: ', LevelGeometryType[this._levelGeometryType]);
    }
  }

  public UpdatePlayableTextureCount(level: number): void {
    let target = DEFAULT_PLAYABLE_TEXTURE_COUNT;
    if (level <= 10) {
      this._playableTextureCount = target;
      this._playableTextureCountColor = DIFFICULT_LEVEL_COLOR[0];
    } else if (level > 10 && level <= 20) {
      this._playableTextureCount = target + 1;
      this._playableTextureCountColor = DIFFICULT_LEVEL_COLOR[1];
    } else if (level > 20 && level <= 40) {
      this._playableTextureCount = target + 2;
      this._playableTextureCountColor = DIFFICULT_LEVEL_COLOR[2];
    } else if (level > 40) {
      this._playableTextureCount = target + 3;
      this._playableTextureCountColor = DIFFICULT_LEVEL_COLOR[3];
    }

    if (!environment.production) {
      console.info('Playable Texture Count: ', this._playableTextureCount, 'for level:', level);
    }
  }

  public PowerMoveSelection(): PowerMoveType {
    let moveType = PowerMoveType.None;
    if (this.LevelGeometryType === LevelGeometryType.Cube) {
      const enumValues = Object.keys(PowerMoveType)
        .map((po) => Number.parseInt(po))
        .filter((po) => !Number.isNaN(po) as unknown as PowerMoveType[keyof PowerMoveType][]);
      const inx = Math.floor(Math.random() * enumValues.length - 1);
      moveType = enumValues[inx];
    } else {
      const horizontalPowerMoves = [
        PowerMoveType.None,
        PowerMoveType.HorizontalLeft,
        PowerMoveType.HorizontalMix,
        PowerMoveType.HorizontalRight,
      ];
      moveType = horizontalPowerMoves[Math.floor(Math.random() * horizontalPowerMoves.length - 1)];
    }

    if (!environment.production) {
      console.info('    Power Move Type: ', PowerMoveType[moveType]);
    }

    return moveType;
  }

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
    return this._matches;
  }

  private directionalSearch(gamePiece: GamePiece): void {
    let match: GamePiece | undefined;

    for (const direction in SearchDirection) {
      match = undefined;
      switch (direction) {
        case SearchDirection.Next:
          match = this.matchNext(gamePiece);
          break;
        case SearchDirection.Prev:
          match = this.matchPrev(gamePiece);
          break;
        case SearchDirection.Up:
          match = this.matchAbove(gamePiece);
          break;
        case SearchDirection.Down:
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
        Math.abs(p.ThetaOffset - gamePiece.ThetaOffset) < DECIMAL_COMPARISON_TOLERANCE
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
        Math.abs(p.ThetaOffset - gamePiece.ThetaOffset) < DECIMAL_COMPARISON_TOLERANCE
    );
  }
}
