import { DECIMAL_COMPARISON_TOLERANCE, GRID_VERTICAL_OFFSET } from '../../game-constants';
import { GravityType } from '../../models/gravity-type';
import { GravityResolutionResult, GravityShiftAction } from '../models/gravity-action';
import { getNodeIsPowerMove, getNodeIsRemoved, getNodeTheta, getWheelPieces } from '../utils/node-adapters';

export interface IGravityPiece {
  thetaOffset?: number;
  isRemoved?: boolean;
  isPowerMove?: boolean;
}

export interface IGravityWheel<TPiece extends IGravityPiece = IGravityPiece> {
  readonly pieces?: readonly TPiece[] | TPiece[];
  readonly children?: readonly unknown[];
}

/**
 * Pure calculation of piece shifts and new piece spawns under gravity rules.
 */
export function calculateGravityShift<TPiece extends IGravityPiece>(
  axle: readonly IGravityWheel<TPiece>[],
  gravityType: GravityType,
  mixResolver?: () => number,
): GravityResolutionResult<TPiece> {
  if (gravityType === GravityType.None || !axle.length) {
    return {
      hasAnyShift: false,
      resolvedGravityType: GravityType.None,
      actions: [],
    };
  }

  let resolvedGravityType = gravityType;
  if (gravityType === GravityType.Mix) {
    const roll = mixResolver ? mixResolver() : Math.random();
    resolvedGravityType = roll < 0.5 ? GravityType.Down : GravityType.Up;
  }

  const numWheels = axle.length;
  const firstWheel = axle[0];
  const samplePieces = getWheelPieces<TPiece>(firstWheel);
  const piecesPerWheel = samplePieces.length;

  // Group pieces into columns by thetaOffset
  const columns: TPiece[][] = [];

  for (let pIdx = 0; pIdx < piecesPerWheel; pIdx++) {
    const samplePiece = samplePieces[pIdx];
    const column: TPiece[] = [];
    const targetTheta = getNodeTheta(samplePiece);
    for (let wIdx = 0; wIdx < numWheels; wIdx++) {
      const wheelPieces = getWheelPieces<TPiece>(axle[wIdx]);
      const matchPiece = wheelPieces.find(
        (p) => Math.abs(getNodeTheta(p) - targetTheta) < DECIMAL_COMPARISON_TOLERANCE,
      );
      if (matchPiece) {
        column.push(matchPiece);
      }
    }
    if (column.length === numWheels) {
      columns.push(column);
    }
  }

  const actions: GravityShiftAction<TPiece>[] = [];
  let hasAnyShift = false;

  for (const col of columns) {
    const removedIndices: number[] = [];
    col.forEach((p, idx) => {
      if (getNodeIsRemoved(p) && !getNodeIsPowerMove(p)) removedIndices.push(idx);
    });

    if (removedIndices.length === 0) continue;

    hasAnyShift = true;
    const numRemoved = removedIndices.length;

    if (resolvedGravityType === GravityType.Down) {
      const lowestRemoved = Math.min(...removedIndices);

      const nonRemovedAbove: TPiece[] = [];
      for (let i = lowestRemoved; i < numWheels; i++) {
        if (!getNodeIsRemoved(col[i]) || getNodeIsPowerMove(col[i])) {
          nonRemovedAbove.push(col[i]);
        }
      }

      nonRemovedAbove.forEach((sourceP, i) => {
        const targetIdx = lowestRemoved + i;
        const targetP = col[targetIdx];
        const sourceIdx = col.indexOf(sourceP);
        const steps = sourceIdx - targetIdx;
        const startOffsetY = steps * GRID_VERTICAL_OFFSET;

        actions.push({
          targetPiece: targetP,
          sourcePiece: sourceP,
          isNewSpawn: false,
          steps,
          startOffsetY,
        });
      });

      const newSpawnCount = numWheels - (lowestRemoved + nonRemovedAbove.length);
      for (let i = 0; i < newSpawnCount; i++) {
        const targetIdx = numWheels - newSpawnCount + i;
        const targetP = col[targetIdx];
        const steps = numRemoved + i;
        const startOffsetY = steps * GRID_VERTICAL_OFFSET;

        actions.push({
          targetPiece: targetP,
          isNewSpawn: true,
          steps,
          startOffsetY,
        });
      }
    } else if (resolvedGravityType === GravityType.Up) {
      const highestRemoved = Math.max(...removedIndices);

      const nonRemovedBelow: TPiece[] = [];
      for (let i = 0; i <= highestRemoved; i++) {
        if (!getNodeIsRemoved(col[i]) || getNodeIsPowerMove(col[i])) {
          nonRemovedBelow.push(col[i]);
        }
      }

      nonRemovedBelow
        .slice()
        .reverse()
        .forEach((sourceP, i) => {
          const targetIdx = highestRemoved - i;
          const targetP = col[targetIdx];
          const sourceIdx = col.indexOf(sourceP);
          const steps = sourceIdx - targetIdx;
          const startOffsetY = steps * GRID_VERTICAL_OFFSET;

          actions.push({
            targetPiece: targetP,
            sourcePiece: sourceP,
            isNewSpawn: false,
            steps,
            startOffsetY,
          });
        });

      const newSpawnCount = highestRemoved + 1 - nonRemovedBelow.length;
      for (let i = 0; i < newSpawnCount; i++) {
        const targetIdx = i;
        const targetP = col[targetIdx];
        const steps = -(numRemoved + (newSpawnCount - 1 - i));
        const startOffsetY = steps * GRID_VERTICAL_OFFSET;

        actions.push({
          targetPiece: targetP,
          isNewSpawn: true,
          steps,
          startOffsetY,
        });
      }
    }
  }

  return {
    hasAnyShift,
    resolvedGravityType,
    actions,
  };
}
