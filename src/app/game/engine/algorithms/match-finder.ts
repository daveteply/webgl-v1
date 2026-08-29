import { DECIMAL_COMPARISON_TOLERANCE } from '../../game-constants';
import {
  getNodeIsRemoved,
  getNodeMatchKey,
  getNodeNext,
  getNodePrev,
  getNodeTheta,
  getWheelAbovePieces,
  getWheelBelowPieces,
  getWheelPieces,
  setNodeIsMatch,
} from '../utils/node-adapters';

export interface IMatchPiece {
  matchKey?: number;
  thetaOffset?: number;
  isMatch?: boolean;
  isRemoved?: boolean;
  next?: unknown | null;
  prev?: unknown | null;
  parent?: unknown | null;
  parentWheel?: unknown | null;
}

export interface IMatchWheel<T extends IMatchPiece = IMatchPiece> {
  readonly pieces?: readonly T[] | T[];
  readonly children?: readonly unknown[];
  readonly above?: unknown | null;
  readonly below?: unknown | null;
  readonly Above?: unknown | null;
  readonly Below?: unknown | null;
}

/**
 * Pure DFS match search across polar and vertical neighbors.
 * Returns an array of connected matching pieces.
 */
export function findMatches<T extends IMatchPiece>(startPiece: T): T[] {
  const visited = new Set<T>();
  const matches: T[] = [];
  const startKey = getNodeMatchKey(startPiece);

  function traverse(piece: T): void {
    visited.add(piece);
    setNodeIsMatch(piece, true);
    matches.push(piece);

    // Next
    const next = getNodeNext<T>(piece);
    if (next && !visited.has(next) && !getNodeIsRemoved(next) && getNodeMatchKey(next) === startKey) {
      traverse(next);
    }

    // Prev
    const prev = getNodePrev<T>(piece);
    if (prev && !visited.has(prev) && !getNodeIsRemoved(prev) && getNodeMatchKey(prev) === startKey) {
      traverse(prev);
    }

    // Above
    const abovePieces = getWheelAbovePieces<T>(piece);
    if (abovePieces) {
      const matchAbove = abovePieces.find(
        (p) =>
          !visited.has(p) &&
          !getNodeIsRemoved(p) &&
          getNodeMatchKey(p) === startKey &&
          Math.abs(getNodeTheta(p) - getNodeTheta(piece)) < DECIMAL_COMPARISON_TOLERANCE,
      );
      if (matchAbove) {
        traverse(matchAbove);
      }
    }

    // Below
    const belowPieces = getWheelBelowPieces<T>(piece);
    if (belowPieces) {
      const matchBelow = belowPieces.find(
        (p) =>
          !visited.has(p) &&
          !getNodeIsRemoved(p) &&
          getNodeMatchKey(p) === startKey &&
          Math.abs(getNodeTheta(p) - getNodeTheta(piece)) < DECIMAL_COMPARISON_TOLERANCE,
      );
      if (matchBelow) {
        traverse(matchBelow);
      }
    }
  }

  traverse(startPiece);
  return matches;
}

/**
 * Pure search across all wheels to find all clusters with at least 3 matching pieces.
 */
export function findAllMatches<T extends IMatchPiece>(wheels: readonly IMatchWheel<T>[]): T[] {
  const allMatches = new Set<T>();

  // Reset isMatch on all pieces before global search
  for (const wheel of wheels) {
    for (const piece of getWheelPieces<T>(wheel)) {
      setNodeIsMatch(piece, false);
    }
  }

  for (const wheel of wheels) {
    for (const piece of getWheelPieces<T>(wheel)) {
      if (!getNodeIsRemoved(piece) && !allMatches.has(piece)) {
        const cluster = findMatches(piece);
        if (cluster.length >= 3) {
          cluster.forEach((m) => allMatches.add(m));
        } else {
          // Reset isMatch for sub-threshold clusters
          cluster.forEach((m) => {
            setNodeIsMatch(m, false);
          });
        }
      }
    }
  }

  return Array.from(allMatches);
}
