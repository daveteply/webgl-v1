import { GravityType } from '../../models/gravity-type';

export interface GravityShiftAction<TPiece = unknown> {
  targetPiece: TPiece;
  sourcePiece?: TPiece;
  isNewSpawn: boolean;
  steps: number;
  startOffsetY: number;
}

export interface GravityResolutionResult<TPiece = unknown> {
  hasAnyShift: boolean;
  resolvedGravityType: GravityType;
  actions: GravityShiftAction<TPiece>[];
}
