import { LevelOrientationType } from './level-orientation-type';

export enum PowerMoveType {
  None = 1,
  HorizontalRight,
  HorizontalLeft,
  HorizontalMix,
  VerticalUp,
  VerticalDown,
  VerticalMix,
  Bomb,
}

const POWER_MOVE_KEYS: Record<LevelOrientationType, Partial<Record<PowerMoveType, string>>> = {
  [LevelOrientationType.Vertical]: {
    [PowerMoveType.HorizontalRight]: 'POWER_MOVES.SPIN_RIGHT',
    [PowerMoveType.HorizontalLeft]: 'POWER_MOVES.SPIN_LEFT',
    [PowerMoveType.HorizontalMix]: 'POWER_MOVES.SPIN_MIX',
    [PowerMoveType.VerticalUp]: 'POWER_MOVES.ROLL_UP',
    [PowerMoveType.VerticalDown]: 'POWER_MOVES.ROLL_DOWN',
    [PowerMoveType.VerticalMix]: 'POWER_MOVES.ROLL_MIX',
    [PowerMoveType.Bomb]: 'POWER_MOVES.KABOOM',
  },
  [LevelOrientationType.HorizontalRight]: {
    [PowerMoveType.HorizontalRight]: 'POWER_MOVES.SPIN_UP',
    [PowerMoveType.HorizontalLeft]: 'POWER_MOVES.SPIN_DOWN',
    [PowerMoveType.HorizontalMix]: 'POWER_MOVES.SPIN_MIX',
    [PowerMoveType.VerticalUp]: 'POWER_MOVES.ROLL_LEFT',
    [PowerMoveType.VerticalDown]: 'POWER_MOVES.ROLL_RIGHT',
    [PowerMoveType.VerticalMix]: 'POWER_MOVES.ROLL_MIX',
    [PowerMoveType.Bomb]: 'POWER_MOVES.KABOOM',
  },
  [LevelOrientationType.HorizontalLeft]: {
    [PowerMoveType.HorizontalRight]: 'POWER_MOVES.SPIN_DOWN',
    [PowerMoveType.HorizontalLeft]: 'POWER_MOVES.SPIN_UP',
    [PowerMoveType.HorizontalMix]: 'POWER_MOVES.SPIN_MIX',
    [PowerMoveType.VerticalUp]: 'POWER_MOVES.ROLL_RIGHT',
    [PowerMoveType.VerticalDown]: 'POWER_MOVES.ROLL_LEFT',
    [PowerMoveType.VerticalMix]: 'POWER_MOVES.ROLL_MIX',
    [PowerMoveType.Bomb]: 'POWER_MOVES.KABOOM',
  },
};

export function GetPowerMoveTranslationKey(
  type: PowerMoveType,
  orientation: LevelOrientationType = LevelOrientationType.Vertical,
): string {
  return POWER_MOVE_KEYS[orientation]?.[type] ?? 'POWER_MOVES.DEFAULT';
}
