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

const POWER_MOVE_LABELS: Record<LevelOrientationType, Partial<Record<PowerMoveType, string>>> = {
  [LevelOrientationType.Vertical]: {
    [PowerMoveType.HorizontalRight]: 'Spin right',
    [PowerMoveType.HorizontalLeft]: 'Spin left',
    [PowerMoveType.HorizontalMix]: 'Spin mix',
    [PowerMoveType.VerticalUp]: 'Roll up',
    [PowerMoveType.VerticalDown]: 'Roll down',
    [PowerMoveType.VerticalMix]: 'Roll mix',
    [PowerMoveType.Bomb]: 'Kaboom',
  },
  [LevelOrientationType.HorizontalRight]: {
    [PowerMoveType.HorizontalRight]: 'Spin down',
    [PowerMoveType.HorizontalLeft]: 'Spin up',
    [PowerMoveType.HorizontalMix]: 'Spin mix',
    [PowerMoveType.VerticalUp]: 'Roll left',
    [PowerMoveType.VerticalDown]: 'Roll right',
    [PowerMoveType.VerticalMix]: 'Roll mix',
    [PowerMoveType.Bomb]: 'Kaboom',
  },
  [LevelOrientationType.HorizontalLeft]: {
    [PowerMoveType.HorizontalRight]: 'Spin up',
    [PowerMoveType.HorizontalLeft]: 'Spin down',
    [PowerMoveType.HorizontalMix]: 'Spin mix',
    [PowerMoveType.VerticalUp]: 'Roll right',
    [PowerMoveType.VerticalDown]: 'Roll left',
    [PowerMoveType.VerticalMix]: 'Roll mix',
    [PowerMoveType.Bomb]: 'Kaboom',
  },
};

export function GetPowerMoveLabel(
  type: PowerMoveType,
  orientation: LevelOrientationType = LevelOrientationType.Vertical,
): string {
  return POWER_MOVE_LABELS[orientation]?.[type] ?? 'Power move';
}
