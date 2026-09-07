import { describe, it, expect } from 'vitest';
import { findMatches, findAllMatches, IMatchPiece } from './match-finder';

interface TestWheel {
  pieces: TestPiece[];
  above?: TestWheel;
  below?: TestWheel;
}

interface TestPiece extends IMatchPiece {
  id: number;
  matchKey: number;
  thetaOffset: number;
  isMatch: boolean;
  isRemoved: boolean;
  next?: TestPiece;
  prev?: TestPiece;
  parentWheel?: TestWheel;
}

function createPiece(id: number, matchKey: number, thetaOffset: number): TestPiece {
  return {
    id,
    matchKey,
    thetaOffset,
    isMatch: false,
    isRemoved: false,
  };
}

function createRing(keys: number[], thetaStart = 0): TestPiece[] {
  const pieces = keys.map((key, i) => createPiece(i, key, thetaStart + (i * Math.PI) / 4));
  for (let i = 0; i < pieces.length; i++) {
    const nextIdx = (i + 1) % pieces.length;
    const prevIdx = (i - 1 + pieces.length) % pieces.length;
    pieces[i].next = pieces[nextIdx];
    pieces[i].prev = pieces[prevIdx];
  }
  return pieces;
}

describe('match-finder', () => {
  it('should return only the start piece when there are no matching neighbors', () => {
    const ring = createRing([1, 2, 3, 4, 5, 6, 7, 8]);
    const matches = findMatches(ring[0]);
    expect(matches.length).toBe(1);
    expect(matches[0].id).toBe(0);
  });

  it('should find contiguous horizontal matches along Next and Prev', () => {
    const ring = createRing([1, 1, 1, 2, 3, 4, 5, 6]);
    const matches = findMatches(ring[1]);
    expect(matches.length).toBe(3);
    const ids = matches.map((m) => m.id);
    expect(ids).toContain(0);
    expect(ids).toContain(1);
    expect(ids).toContain(2);
  });

  it('should traverse entire circular matching ring without infinite loop', () => {
    const ring = createRing([1, 1, 1, 1, 1, 1, 1, 1]);
    const matches = findMatches(ring[0]);
    expect(matches.length).toBe(8);
  });

  it('should not match removed pieces', () => {
    const ring = createRing([1, 1, 1, 1]);
    ring[1].isRemoved = true;
    const matches = findMatches(ring[0]);
    // Can only match prev (ring[3]), ring[1] is blocked
    expect(matches.map((m) => m.id)).not.toContain(1);
  });

  it('should find vertical matches across wheels via Above and Below links', () => {
    const wheel0Pieces = createRing([1, 2, 3, 4]);
    const wheel1Pieces = createRing([1, 2, 3, 4]);
    const wheel2Pieces = createRing([1, 2, 3, 4]);

    const wheel0: TestWheel = { pieces: wheel0Pieces };
    const wheel1: TestWheel = { pieces: wheel1Pieces };
    const wheel2: TestWheel = { pieces: wheel2Pieces };

    wheel0.above = wheel1;
    wheel1.below = wheel0;
    wheel1.above = wheel2;
    wheel2.below = wheel1;

    wheel0Pieces.forEach((p) => (p.parentWheel = wheel0));
    wheel1Pieces.forEach((p) => (p.parentWheel = wheel1));
    wheel2Pieces.forEach((p) => (p.parentWheel = wheel2));

    const matches = findMatches(wheel1Pieces[0]);
    expect(matches.length).toBe(3);
    expect(matches).toContain(wheel0Pieces[0]);
    expect(matches).toContain(wheel1Pieces[0]);
    expect(matches).toContain(wheel2Pieces[0]);
  });

  it('should find 2D cross/T-junction matches spanning both horizontal and vertical directions', () => {
    const wheel0Pieces = createRing([2, 1, 2, 2]);
    const wheel1Pieces = createRing([1, 1, 1, 2]); // center piece is id 1 (matchKey 1)
    const wheel2Pieces = createRing([2, 1, 2, 2]);

    const wheel0: TestWheel = { pieces: wheel0Pieces };
    const wheel1: TestWheel = { pieces: wheel1Pieces };
    const wheel2: TestWheel = { pieces: wheel2Pieces };

    wheel0.above = wheel1;
    wheel1.below = wheel0;
    wheel1.above = wheel2;
    wheel2.below = wheel1;

    wheel0Pieces.forEach((p) => (p.parentWheel = wheel0));
    wheel1Pieces.forEach((p) => (p.parentWheel = wheel1));
    wheel2Pieces.forEach((p) => (p.parentWheel = wheel2));

    // Starting from wheel1 center (id: 1, key: 1)
    const matches = findMatches(wheel1Pieces[1]);
    // Expected: wheel1[0], wheel1[1], wheel1[2], wheel0[1], wheel2[1] = 5 pieces
    expect(matches.length).toBe(5);
  });

  it('should find all valid 3+ match clusters on the board with findAllMatches', () => {
    const wheel0Pieces = createRing([1, 1, 1, 2, 2, 3, 4, 5]); // 3 matchKey:1
    const wheel1Pieces = createRing([6, 7, 8, 9, 9, 9, 0, 0]); // 3 matchKey:9
    const wheels = [{ pieces: wheel0Pieces }, { pieces: wheel1Pieces }];

    const allMatches = findAllMatches(wheels);
    expect(allMatches.length).toBe(6);
    expect(allMatches.map((m) => m.matchKey)).toContain(1);
    expect(allMatches.map((m) => m.matchKey)).toContain(9);
    expect(allMatches.map((m) => m.matchKey)).not.toContain(2); // 2 is only 2 pieces
  });
});
