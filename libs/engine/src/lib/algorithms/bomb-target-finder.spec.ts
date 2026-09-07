import { describe, it, expect } from 'vitest';
import { findBombTargets, IBombPiece, IBombWheel } from './bomb-target-finder';

interface TestBombPiece extends IBombPiece {
  id: string;
  thetaOffset: number;
  isRemoved: boolean;
  next?: TestBombPiece;
  prev?: TestBombPiece;
}

function buildGrid(
  numWheels: number,
  piecesPerWheel: number,
): { axle: IBombWheel<TestBombPiece>[]; grid: TestBombPiece[][] } {
  const grid: TestBombPiece[][] = [];
  const axle: IBombWheel<TestBombPiece>[] = [];

  for (let w = 0; w < numWheels; w++) {
    const wheelPieces: TestBombPiece[] = [];
    for (let p = 0; p < piecesPerWheel; p++) {
      wheelPieces.push({
        id: `w${w}_p${p}`,
        thetaOffset: (p * 2 * Math.PI) / piecesPerWheel,
        isRemoved: false,
      });
    }
    // link next/prev
    for (let p = 0; p < piecesPerWheel; p++) {
      wheelPieces[p].next = wheelPieces[(p + 1) % piecesPerWheel];
      wheelPieces[p].prev = wheelPieces[(p - 1 + piecesPerWheel) % piecesPerWheel];
    }
    grid.push(wheelPieces);
    axle.push({ pieces: wheelPieces });
  }

  return { axle, grid };
}

describe('bomb-target-finder', () => {
  it('should return only the bomb piece when wheelIndex is invalid', () => {
    const { axle, grid } = buildGrid(5, 8);
    const targets = findBombTargets(grid[0][0], axle, -1, 5);
    expect(targets).toEqual([grid[0][0]]);
  });

  it('should omit corner pieces (|dx|=2 and |dy|=2) in blast calculation', () => {
    const { axle, grid } = buildGrid(7, 12);
    const centerPiece = grid[3][6]; // Center wheel (w=3), piece index 6
    const targets = findBombTargets(centerPiece, axle, 3, 20); // high level so max 21 allowed

    const targetIds = targets.map((t) => t.id);

    // Center piece must be included
    expect(targetIds).toContain('w3_p6');

    // Cardinal dx=0, dy=+-2 must be included
    expect(targetIds).toContain('w1_p6');
    expect(targetIds).toContain('w5_p6');

    // Cardinal dy=0, dx=+-2 must be included
    expect(targetIds).toContain('w3_p4');
    expect(targetIds).toContain('w3_p8');

    // Corners (|dx|=2, |dy|=2) MUST NOT be included
    expect(targetIds).not.toContain('w1_p4'); // dy=-2, dx=-2
    expect(targetIds).not.toContain('w1_p8'); // dy=-2, dx=+2
    expect(targetIds).not.toContain('w5_p4'); // dy=+2, dx=-2
    expect(targetIds).not.toContain('w5_p8'); // dy=+2, dx=+2
  });

  it('should scale max target piece count according to level', () => {
    const { axle, grid } = buildGrid(7, 12);
    const centerPiece = grid[3][6];

    // Level 1: floor(1 * 1.5) = 1, clamped to min 5
    const targetsL1 = findBombTargets(centerPiece, axle, 3, 1);
    expect(targetsL1.length).toBe(5);

    // Level 6: floor(6 * 1.5) = 9
    const targetsL6 = findBombTargets(centerPiece, axle, 3, 6);
    expect(targetsL6.length).toBe(9);

    // Level 25: floor(25 * 1.5) = 37, clamped to max 21
    const targetsL25 = findBombTargets(centerPiece, axle, 3, 25);
    expect(targetsL25.length).toBe(21);
  });

  it('should skip pieces that are already removed', () => {
    const { axle, grid } = buildGrid(5, 8);
    const centerPiece = grid[2][4];
    grid[2][5].isRemoved = true; // dx=+1 neighbor removed

    const targets = findBombTargets(centerPiece, axle, 2, 10);
    const targetIds = targets.map((t) => t.id);
    expect(targetIds).not.toContain('w2_p5');
  });
});
