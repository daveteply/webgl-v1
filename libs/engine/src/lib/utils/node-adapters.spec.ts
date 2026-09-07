import { describe, it, expect } from 'vitest';
import {
  getNodeTheta,
  getNodeIsRemoved,
  getNodeIsPowerMove,
  getNodeMatchKey,
  setNodeIsMatch,
  getNodeNext,
  getNodePrev,
  getWheelPieces,
  getWheelAbovePieces,
  getWheelBelowPieces,
} from './node-adapters';

describe('node-adapters', () => {
  it('should extract theta from camelCase or PascalCase properties', () => {
    expect(getNodeTheta(null)).toBe(0);
    expect(getNodeTheta({ thetaOffset: 1.23 })).toBe(1.23);
    expect(getNodeTheta({ ThetaOffset: 4.56 })).toBe(4.56);
  });

  it('should extract isRemoved from camelCase or PascalCase properties', () => {
    expect(getNodeIsRemoved(null)).toBe(false);
    expect(getNodeIsRemoved({ isRemoved: true })).toBe(true);
    expect(getNodeIsRemoved({ IsRemoved: true })).toBe(true);
    expect(getNodeIsRemoved({ isRemoved: false })).toBe(false);
  });

  it('should extract isPowerMove from camelCase or PascalCase properties', () => {
    expect(getNodeIsPowerMove(null)).toBe(false);
    expect(getNodeIsPowerMove({ isPowerMove: true })).toBe(true);
    expect(getNodeIsPowerMove({ IsPowerMove: true })).toBe(true);
  });

  it('should extract matchKey from camelCase or PascalCase properties', () => {
    expect(getNodeMatchKey(null)).toBe(0);
    expect(getNodeMatchKey({ matchKey: 5 })).toBe(5);
    expect(getNodeMatchKey({ MatchKey: 8 })).toBe(8);
  });

  it('should set isMatch on both camelCase and PascalCase properties if present', () => {
    const obj1: Record<string, unknown> = { isMatch: false };
    setNodeIsMatch(obj1, true);
    expect(obj1['isMatch']).toBe(true);

    const obj2: Record<string, unknown> = { IsMatch: false };
    setNodeIsMatch(obj2, true);
    expect(obj2['IsMatch']).toBe(true);
    expect(obj2['isMatch']).toBe(true);
  });

  it('should navigate next and prev links', () => {
    const pieceA = { id: 'A' };
    const pieceB = { id: 'B' };
    expect(getNodeNext({ next: pieceB })).toBe(pieceB);
    expect(getNodeNext({ Next: pieceB })).toBe(pieceB);
    expect(getNodePrev({ prev: pieceA })).toBe(pieceA);
    expect(getNodePrev({ Prev: pieceA })).toBe(pieceA);
  });

  it('should extract wheel pieces from pieces array or children array', () => {
    expect(getWheelPieces(null)).toEqual([]);
    expect(getWheelPieces({ pieces: [1, 2, 3] })).toEqual([1, 2, 3]);
    expect(getWheelPieces({ children: [4, 5, 6] })).toEqual([4, 5, 6]);
  });

  it('should resolve above and below wheel pieces from parent references', () => {
    const aboveWheel = { pieces: [{ id: 'above-1' }] };
    const belowWheel = { children: [{ id: 'below-1' }] };

    const piece = {
      parentWheel: {
        above: aboveWheel,
        below: belowWheel,
      },
    };

    expect(getWheelAbovePieces(piece)).toEqual(aboveWheel.pieces);
    expect(getWheelBelowPieces(piece)).toEqual(belowWheel.children);
  });
});
