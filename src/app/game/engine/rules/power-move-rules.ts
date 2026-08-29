import {
  BOMB_TARGET_LEVEL_MULTIPLIER,
  BOMB_TARGET_MAX_PIECES,
  BOMB_TARGET_MIN_PIECES,
  DIFFICULTY_TIER_2,
  MINIMUM_MATCH_COUNT,
  POWER_MOVE_START_BOMB,
  POWER_MOVE_START_LEVEL,
  POWER_MOVE_START_MIX,
  POWER_MOVE_START_VERTICAL,
} from '../../game-constants';
import { LevelGeometryType } from '../../models/level-geometry-type';
import { PowerMoveType } from '../../models/power-move-type';

/**
 * Pure calculation of the maximum pieces a bomb power move can remove at a given level.
 */
export function calculateBombMaxTargetCount(level: number): number {
  return Math.min(
    BOMB_TARGET_MAX_PIECES,
    Math.max(BOMB_TARGET_MIN_PIECES, Math.floor(level * BOMB_TARGET_LEVEL_MULTIPLIER)),
  );
}

/**
 * Pure selection of power move from available pool based on level progression and geometry.
 */
export function selectPowerMove(
  level: number,
  geometryType: LevelGeometryType,
  rng: () => number = Math.random,
): PowerMoveType {
  if (level < POWER_MOVE_START_LEVEL) {
    return PowerMoveType.None;
  }

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
  if (geometryType === LevelGeometryType.Cylinder || geometryType === LevelGeometryType.Dodecahedron) {
    const verticalMoves = new Set([PowerMoveType.VerticalUp, PowerMoveType.VerticalDown, PowerMoveType.VerticalMix]);
    for (let i = availableTypes.length - 1; i >= 0; i--) {
      if (verticalMoves.has(availableTypes[i])) {
        availableTypes.splice(i, 1);
      }
    }
  }

  const selectionPool: PowerMoveType[] = [...availableTypes, PowerMoveType.None];
  return selectionPool[Math.floor(rng() * selectionPool.length)];
}

/**
 * Pure evaluation determining if a match triggers a power move and which type.
 */
export function evaluatePowerMove(
  matchCount: number,
  level: number,
  geometryType: LevelGeometryType,
  rng: () => number = Math.random,
): PowerMoveType {
  const powerMoveTarget = level >= DIFFICULTY_TIER_2 ? MINIMUM_MATCH_COUNT : MINIMUM_MATCH_COUNT + 1;
  if (matchCount < powerMoveTarget) {
    return PowerMoveType.None;
  }
  return selectPowerMove(level, geometryType, rng);
}
