import { Injectable, isDevMode } from '@angular/core';
import {
  DECIMAL_COMPARISON_TOLERANCE,
  DIFFICULTY_TIER_2,
  GRAVITY_START_DOWN,
  GRAVITY_START_MIX,
  GRAVITY_START_UP,
  LEVEL_START_CYLINDER,
  LEVEL_START_DODECAHEDRON,
  MATERIAL_START_BUMP,
  MATERIAL_START_COLOR,
  MATERIAL_START_EMOJI,
  MINIMUM_MATCH_COUNT,
  PLAYABLE_TEXTURE_COUNT,
  POWER_MOVE_START_BOMB,
  POWER_MOVE_START_LEVEL,
  POWER_MOVE_START_MIX,
  POWER_MOVE_START_VERTICAL,
} from '../game-constants';
import { LevelGeometryType } from '../models/level-geometry-type';
import { LevelMaterialType } from '../models/level-material-type';
import { GravityType } from '../models/gravity-type';
import { GamePiece } from '../models/game-piece/game-piece';
import { GameWheel } from '../models/game-wheel';
import { PowerMoveType } from '../models/power-move-type';
import { LevelTransitionType } from './level-transition-type';
import { PRNG } from '../../shared/utils/prng';

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

  get PlayableTextureCount(): number {
    return PLAYABLE_TEXTURE_COUNT;
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

  public InitLevelTypes(level: number, rng?: PRNG): void {
    const getRandom = rng ? () => rng.next() : Math.random;

    // gradual geometry type introduction
    this._levelGeometryType = LevelGeometryType.Cube;
    if (level >= LEVEL_START_CYLINDER && Math.floor(getRandom() * 2) === 0) {
      if (level >= LEVEL_START_DODECAHEDRON) {
        const otherGeoRoll = Math.floor(getRandom() * 2);
        this._levelGeometryType = otherGeoRoll === 0 ? LevelGeometryType.Cylinder : LevelGeometryType.Dodecahedron;
      } else {
        this._levelGeometryType = LevelGeometryType.Cylinder;
      }
    }

    // gradual material type introduction
    if (this._levelGeometryType === LevelGeometryType.Dodecahedron) {
      // Dodecahedron levels are constrained to ColorBumpShape, Color, or ColorBumpMaterial
      const dodecahedronMaterials = [
        LevelMaterialType.ColorBumpShape,
        LevelMaterialType.Color,
        LevelMaterialType.ColorBumpMaterial,
      ];
      this._levelMaterialType = dodecahedronMaterials[Math.floor(getRandom() * dodecahedronMaterials.length)];
    } else if (level < MATERIAL_START_COLOR) {
      this._levelMaterialType = LevelMaterialType.ColorBumpShape;
    } else if (level < MATERIAL_START_BUMP) {
      const level4Materials = [LevelMaterialType.ColorBumpShape, LevelMaterialType.Color];
      this._levelMaterialType = level4Materials[Math.floor(getRandom() * level4Materials.length)];
    } else if (level < MATERIAL_START_EMOJI) {
      const level8Materials = [
        LevelMaterialType.ColorBumpShape,
        LevelMaterialType.Color,
        LevelMaterialType.ColorBumpMaterial,
      ];
      this._levelMaterialType = level8Materials[Math.floor(getRandom() * level8Materials.length)];
    } else {
      const allMaterials = [
        LevelMaterialType.ColorBumpShape,
        LevelMaterialType.Color,
        LevelMaterialType.ColorBumpMaterial,
        LevelMaterialType.Emoji,
      ];
      this._levelMaterialType = allMaterials[Math.floor(getRandom() * allMaterials.length)];
    }

    // gradual gravity type introduction
    if (level < GRAVITY_START_DOWN) {
      this._gravityType = GravityType.None;
    } else if (level < GRAVITY_START_UP) {
      const gravityOptions = [GravityType.None, GravityType.Down];
      this._gravityType = gravityOptions[Math.floor(getRandom() * gravityOptions.length)];
    } else if (level < GRAVITY_START_MIX) {
      const gravityOptions = [GravityType.None, GravityType.Down, GravityType.Up];
      this._gravityType = gravityOptions[Math.floor(getRandom() * gravityOptions.length)];
    } else {
      const gravityOptions = [GravityType.None, GravityType.Down, GravityType.Up, GravityType.Mix];
      this._gravityType = gravityOptions[Math.floor(getRandom() * gravityOptions.length)];
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

  public InitLevelTransitionType(level?: number): void {
    if (level !== undefined && level <= 3) {
      this._levelTransitionType = LevelTransitionType.Default;
    } else if (level !== undefined && level <= 6) {
      this._levelTransitionType = Math.floor(Math.random() * 2);
    } else {
      this._levelTransitionType = Math.floor(Math.random() * 3);
    }
    if (isDevMode()) {
      console.info('Level Transition:', LevelTransitionType[this._levelTransitionType]);
    }
  }

  public PowerMoveSelection(level: number): PowerMoveType {
    // Power moves begin at POWER_MOVE_START_LEVEL
    if (level < POWER_MOVE_START_LEVEL) {
      return PowerMoveType.None;
    }

    // Build available power moves based on progression increments
    const availableTypes: PowerMoveType[] = [PowerMoveType.HorizontalRight, PowerMoveType.HorizontalLeft];

    if (level >= POWER_MOVE_START_VERTICAL) {
      availableTypes.push(PowerMoveType.VerticalUp, PowerMoveType.VerticalDown);
    }

    if (level >= POWER_MOVE_START_MIX) {
      availableTypes.push(PowerMoveType.HorizontalMix, PowerMoveType.VerticalMix);
    }

    if (level >= POWER_MOVE_START_BOMB) {
      availableTypes.push(PowerMoveType.Bomb);
    }

    // Filter vertical moves for Cylinder and Dodecahedron geometries
    if (
      this.LevelGeometryType === LevelGeometryType.Cylinder ||
      this.LevelGeometryType === LevelGeometryType.Dodecahedron
    ) {
      const verticalMoves = new Set([PowerMoveType.VerticalUp, PowerMoveType.VerticalDown, PowerMoveType.VerticalMix]);
      for (let i = availableTypes.length - 1; i >= 0; i--) {
        if (verticalMoves.has(availableTypes[i])) {
          availableTypes.splice(i, 1);
        }
      }
    }

    // Always retain a chance of None
    const selectionPool: PowerMoveType[] = [...availableTypes, PowerMoveType.None];

    const moveType = selectionPool[Math.floor(Math.random() * selectionPool.length)];

    if (isDevMode()) {
      console.info('    Power Move Type: ', PowerMoveType[moveType]);
    }

    return moveType;
  }

  public EvaluatePowerMove(matchCount: number, level: number): PowerMoveType {
    const powerMoveTarget = level >= DIFFICULTY_TIER_2 ? MINIMUM_MATCH_COUNT : MINIMUM_MATCH_COUNT + 1;
    if (matchCount < powerMoveTarget) {
      return PowerMoveType.None;
    }
    return this.PowerMoveSelection(level);
  }

  public FindBombTargets(bombPiece: GamePiece, axle: GameWheel[], level: number): GamePiece[] {
    const parentWheel = bombPiece.parent as GameWheel;
    const centerWheelIndex = axle.indexOf(parentWheel);
    if (centerWheelIndex === -1) {
      return [bombPiece];
    }

    const targetPieces = new Set<GamePiece>();
    targetPieces.add(bombPiece);

    // Scan vertical wheels from -2 to +2
    for (let dy = -2; dy <= 2; dy++) {
      const wheelIndex = centerWheelIndex + dy;
      if (wheelIndex < 0 || wheelIndex >= axle.length) continue;

      const wheel = axle[wheelIndex];
      const pieces = wheel.children as GamePiece[];

      // Locate piece at the same angular position (ThetaOffset)
      let centerPieceOnWheel = pieces.find(
        (p) => Math.abs(p.ThetaOffset - bombPiece.ThetaOffset) < DECIMAL_COMPARISON_TOLERANCE,
      );

      if (!centerPieceOnWheel && pieces.length > 0) {
        let minDiff = Infinity;
        centerPieceOnWheel = pieces[0];
        for (const p of pieces) {
          const diff = Math.abs(p.ThetaOffset - bombPiece.ThetaOffset);
          if (diff < minDiff) {
            minDiff = diff;
            centerPieceOnWheel = p;
          }
        }
      }

      if (!centerPieceOnWheel) continue;

      // Scan horizontal pieces from -2 to +2 (omitting corners at |dx|=2 and |dy|=2)
      // dx=0 (center), dx=1 (Next), dx=2 (Next.Next), dx=-1 (Prev), dx=-2 (Prev.Prev)
      const horizontalPieces: { dx: number; piece: GamePiece }[] = [
        { dx: 0, piece: centerPieceOnWheel },
        { dx: 1, piece: centerPieceOnWheel.Next },
        { dx: 2, piece: centerPieceOnWheel.Next.Next },
        { dx: -1, piece: centerPieceOnWheel.Prev },
        { dx: -2, piece: centerPieceOnWheel.Prev.Prev },
      ];

      for (const item of horizontalPieces) {
        // Omit the 4 corner pieces of the 5x5 bounding box
        if (Math.abs(item.dx) === 2 && Math.abs(dy) === 2) {
          continue;
        }

        if (item.piece && !item.piece.IsRemoved) {
          targetPieces.add(item.piece);
        }
      }
    }

    // Scale pieces removed by level (minimum 5, maximum 21 circular blast pieces)
    const maxPieces = Math.min(21, Math.max(5, Math.floor(level * 1.5)));
    const result = Array.from(targetPieces);
    return result.slice(0, maxPieces);
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
    const allMatches = new Set<GamePiece>();
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
