import { DECIMAL_COMPARISON_TOLERANCE } from '../../game-constants';
import { calculateBombMaxTargetCount } from '../rules/power-move-rules';
import { getNodeIsRemoved, getNodeNext, getNodePrev, getNodeTheta, getWheelPieces } from '../utils/node-adapters';

export interface IBombPiece {
  thetaOffset?: number;
  isRemoved?: boolean;
  next?: unknown | null;
  prev?: unknown | null;
}

export interface IBombWheel<TPiece extends IBombPiece = IBombPiece> {
  readonly pieces?: readonly TPiece[] | TPiece[];
  readonly children?: readonly unknown[];
}

/**
 * Pure calculation of bomb blast target pieces in a circular radius around a bomb piece.
 */
export function findBombTargets<TPiece extends IBombPiece>(
  bombPiece: TPiece,
  axle: readonly IBombWheel<TPiece>[],
  centerWheelIndex: number,
  level: number,
): TPiece[] {
  if (centerWheelIndex < 0 || centerWheelIndex >= axle.length) {
    return [bombPiece];
  }

  const targetPieces = new Set<TPiece>();
  targetPieces.add(bombPiece);
  const bombTheta = getNodeTheta(bombPiece);

  // Scan vertical wheels from -2 to +2
  for (let dy = -2; dy <= 2; dy++) {
    const wheelIndex = centerWheelIndex + dy;
    if (wheelIndex < 0 || wheelIndex >= axle.length) continue;

    const wheel = axle[wheelIndex];
    const pieces = getWheelPieces<TPiece>(wheel);

    // Locate piece at the same angular position (thetaOffset)
    let centerPieceOnWheel = pieces.find((p) => Math.abs(getNodeTheta(p) - bombTheta) < DECIMAL_COMPARISON_TOLERANCE);

    if (!centerPieceOnWheel && pieces.length > 0) {
      let minDiff = Infinity;
      centerPieceOnWheel = pieces[0];
      for (const p of pieces) {
        const diff = Math.abs(getNodeTheta(p) - bombTheta);
        if (diff < minDiff) {
          minDiff = diff;
          centerPieceOnWheel = p;
        }
      }
    }

    if (!centerPieceOnWheel) continue;

    // Scan horizontal pieces from -2 to +2 (omitting corners at |dx|=2 and |dy|=2)
    const next1 = getNodeNext<TPiece>(centerPieceOnWheel);
    const next2 = next1 ? getNodeNext<TPiece>(next1) : undefined;
    const prev1 = getNodePrev<TPiece>(centerPieceOnWheel);
    const prev2 = prev1 ? getNodePrev<TPiece>(prev1) : undefined;

    const horizontalPieces: { dx: number; piece?: TPiece }[] = [
      { dx: 0, piece: centerPieceOnWheel },
      { dx: 1, piece: next1 },
      { dx: 2, piece: next2 },
      { dx: -1, piece: prev1 },
      { dx: -2, piece: prev2 },
    ];

    for (const item of horizontalPieces) {
      if (Math.abs(item.dx) === 2 && Math.abs(dy) === 2) {
        continue;
      }

      if (item.piece && !getNodeIsRemoved(item.piece)) {
        targetPieces.add(item.piece);
      }
    }
  }

  // Scale pieces removed by level (minimum 5, maximum 21 circular blast pieces)
  const maxPieces = calculateBombMaxTargetCount(level);
  return Array.from(targetPieces).slice(0, maxPieces);
}
