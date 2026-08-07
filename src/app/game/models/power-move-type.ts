export enum PowerMoveType {
  None = 1,
  HorizontalRight,
  HorizontalLeft,
  HorizontalMix,
  VerticalUp,
  VerticalDown,
  VerticalMix,
  Additive,
}

export interface PowerMoveInfo {
  type: PowerMoveType;
  label: string;
}

export const PowerMoveLabel: PowerMoveInfo[] = [
  { type: PowerMoveType.HorizontalRight, label: 'Spin right' },
  { type: PowerMoveType.HorizontalLeft, label: 'Spin left' },
  { type: PowerMoveType.HorizontalMix, label: 'Spin mix' },
  { type: PowerMoveType.VerticalUp, label: 'Roll up' },
  { type: PowerMoveType.VerticalDown, label: 'Roll down' },
  { type: PowerMoveType.VerticalMix, label: 'Roll mix' },
  { type: PowerMoveType.Additive, label: 'Restore' },
];
