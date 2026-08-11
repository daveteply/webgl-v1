import { Injectable, isDevMode } from '@angular/core';
import {
  DECIMAL_COMPARISON_TOLERANCE,
  DEFAULT_PLAYABLE_TEXTURE_COUNT,
  DIFFICULTY_TIER_1,
  DIFFICULTY_TIER_3,
  DIFFICULTY_TIER_4,
  DIFFICULT_LEVEL_COLOR,
  LEVEL_START_OTHER_GEOMETRIES,
} from '../game-constants';
import { LevelGeometryType } from '../level-geometry-type';
import { LevelMaterialType } from '../level-material-type';
import { GravityType } from '../models/gravity-type';
import { GamePiece } from '../models/game-piece/game-piece';
import { GameWheel } from '../models/game-wheel';
import { PowerMoveType } from '../models/power-move-type';
import { LevelTransitionType } from './level-transition-type';

// forcing strings in enum
enum SearchDirection {
  Up = 'Up',
  Down = 'Down',
  Next = 'Next',
  Prev = 'Prev',
}

@Injectable({
  providedIn: 'root',
})
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

  private _gravityType: GravityType = GravityType.None;
  get GravityType(): GravityType {
    return this._gravityType;
  }

  private _levelTransitionType: LevelTransitionType = LevelTransitionType.Default;
  get LevelTransitionType(): LevelTransitionType {
    return this._levelTransitionType;
  }

  public InitLevelTypes(level: number): void {
    // default geometry type
    this._levelGeometryType = LevelGeometryType.Cube;
    if (level > LEVEL_START_OTHER_GEOMETRIES && Math.floor(Math.random() * 2) % 2 === 0) {
      const otherGeoRoll = Math.floor(Math.random() * 2);
      this._levelGeometryType = otherGeoRoll === 0 ? LevelGeometryType.Cylinder : LevelGeometryType.Dodecahedron;
    }

    // set level material type
    if (this._levelGeometryType === LevelGeometryType.Dodecahedron) {
      // Dodecahedron levels are constrained to ColorBumpShape or ColorBumpMaterial
      this._levelMaterialType =
        Math.floor(Math.random() * 2) === 0 ? LevelMaterialType.ColorBumpShape : LevelMaterialType.ColorBumpMaterial;
    } else {
      this._levelMaterialType = level === 1 ? LevelMaterialType.ColorBumpShape : Math.floor(Math.random() * 3) + 1;
    }

    // set gravity type (levels 1 & 2 are always None)
    if (level <= 2) {
      this._gravityType = GravityType.None;
    } else {
      const gravityOptions = [GravityType.None, GravityType.Down, GravityType.Up, GravityType.Mix];
      this._gravityType = gravityOptions[Math.floor(Math.random() * gravityOptions.length)];
    }

    if (isDevMode()) {
      console.info('Level Material Type: ', LevelMaterialType[this._levelMaterialType]);
      console.info('Level Geometry Type: ', LevelGeometryType[this._levelGeometryType]);
      console.info('Level Gravity Type: ', this._gravityType);
    }
  }

  public RestoreLevelTypes(
    levelMaterialType: LevelMaterialType,
    levelGeometryType: LevelGeometryType,
    gravityType?: GravityType,
  ): void {
    this._levelMaterialType = levelMaterialType;
    this._levelGeometryType = levelGeometryType;
    this._gravityType = gravityType ?? GravityType.None;
  }

  public InitLevelTransitionType(): void {
    this._levelTransitionType = Math.floor(Math.random() * 3);
    if (isDevMode()) {
      console.info('Level Transition:', LevelTransitionType[this._levelTransitionType]);
    }
  }

  public UpdatePlayableTextureCount(level: number): void {
    this._playableTextureCount = DEFAULT_PLAYABLE_TEXTURE_COUNT;
    this._playableTextureCountColor = DIFFICULT_LEVEL_COLOR[0];

    if (isDevMode()) {
      console.info('------------------');
      console.info('Playable Texture Count: ', this._playableTextureCount, 'for level:', level);
    }
  }

  public PowerMoveSelection(level: number): PowerMoveType {
    // create array of power move options
    const powerMoveTypes = Object.keys(PowerMoveType)
      .map((po) => Number.parseInt(po))
      .filter((po) => !Number.isNaN(po) as unknown as PowerMoveType[keyof PowerMoveType][]);

    // remove certain element types
    if (
      this.LevelGeometryType === LevelGeometryType.Cylinder ||
      this.LevelGeometryType === LevelGeometryType.Dodecahedron
    ) {
      powerMoveTypes.splice(powerMoveTypes.indexOf(PowerMoveType.VerticalDown), 1);
      powerMoveTypes.splice(powerMoveTypes.indexOf(PowerMoveType.VerticalMix), 1);
      powerMoveTypes.splice(powerMoveTypes.indexOf(PowerMoveType.VerticalUp), 1);
    }

    // after a certain level, player is always rewarded a power move
    if (level > DIFFICULTY_TIER_3) {
      powerMoveTypes.splice(powerMoveTypes.indexOf(PowerMoveType.None), 1);
    }

    const moveType = powerMoveTypes[Math.floor(Math.random() * powerMoveTypes.length)];

    if (isDevMode()) {
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

  public FindAllMatches(axle: GameWheel[]): GamePiece[] {
    const allMatches: Set<GamePiece> = new Set();
    for (const wheel of axle) {
      for (const piece of wheel.children as GamePiece[]) {
        if (!piece.IsRemoved && !allMatches.has(piece)) {
          const pieceMatches = this.FindMatches(piece, axle);
          if (pieceMatches.length >= 3) {
            pieceMatches.forEach((m) => allMatches.add(m));
          }
        }
      }
    }
    return Array.from(allMatches);
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
    if (gamePiece.Next.IsMatch || gamePiece.Next.IsRemoved) {
      return undefined;
    }

    if (gamePiece.Next.MatchKey === gamePiece.MatchKey) {
      return gamePiece.Next;
    }

    return undefined;
  }

  private matchPrev(gamePiece: GamePiece): GamePiece | undefined {
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
    if (!parentWheel?.Above) {
      return undefined;
    }

    const pieces = parentWheel.Above.children as GamePiece[];
    return pieces.find(
      (p) =>
        !p.IsMatch &&
        !p.IsRemoved &&
        p.MatchKey === gamePiece.MatchKey &&
        Math.abs(p.ThetaOffset - gamePiece.ThetaOffset) < DECIMAL_COMPARISON_TOLERANCE,
    );
  }

  private matchBelow(gamePiece: GamePiece): GamePiece | undefined {
    const parentWheel = gamePiece.parent as GameWheel;
    if (!parentWheel?.Below) {
      return undefined;
    }

    const pieces = parentWheel.Below.children as GamePiece[];
    return pieces.find(
      (p) =>
        !p.IsMatch &&
        !p.IsRemoved &&
        p.MatchKey === gamePiece.MatchKey &&
        Math.abs(p.ThetaOffset - gamePiece.ThetaOffset) < DECIMAL_COMPARISON_TOLERANCE,
    );
  }
}

export { GameEngineService as GameEngine };
