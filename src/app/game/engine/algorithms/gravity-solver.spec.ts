import { describe, it, expect } from 'vitest';
import { calculateGravityShift, IGravityPiece, IGravityWheel } from './gravity-solver';
import { GravityType } from '../../models/gravity-type';

interface TestGravityPiece extends IGravityPiece {
  id: string;
  thetaOffset: number;
  isRemoved: boolean;
  isPowerMove: boolean;
}

function buildGrid(
  numWheels: number,
  piecesPerWheel: number,
): { axle: IGravityWheel<TestGravityPiece>[]; grid: TestGravityPiece[][] } {
  const grid: TestGravityPiece[][] = [];
  const axle: IGravityWheel<TestGravityPiece>[] = [];

  for (let w = 0; w < numWheels; w++) {
    const wheelPieces: TestGravityPiece[] = [];
    for (let p = 0; p < piecesPerWheel; p++) {
      wheelPieces.push({
        id: `w${w}_p${p}`,
        thetaOffset: (p * 2 * Math.PI) / piecesPerWheel,
        isRemoved: false,
        isPowerMove: false,
      });
    }
    grid.push(wheelPieces);
    axle.push({ pieces: wheelPieces });
  }

  return { axle, grid };
}

describe('gravity-solver', () => {
  it('should return no shifts when GravityType is None', () => {
    const { axle, grid } = buildGrid(5, 8);
    grid[0][0].isRemoved = true;

    const result = calculateGravityShift(axle, GravityType.None);
    expect(result.hasAnyShift).toBe(false);
    expect(result.actions.length).toBe(0);
  });

  it('should resolve Mix gravity deterministically with mixResolver', () => {
    const { axle, grid } = buildGrid(5, 8);
    grid[0][0].isRemoved = true;

    const resDown = calculateGravityShift(axle, GravityType.Mix, () => 0.2);
    expect(resDown.resolvedGravityType).toBe(GravityType.Down);

    const resUp = calculateGravityShift(axle, GravityType.Mix, () => 0.8);
    expect(resUp.resolvedGravityType).toBe(GravityType.Up);
  });

  it('should calculate Down gravity shifts and top spawns correctly', () => {
    const { axle, grid } = buildGrid(5, 8);
    // Remove w0_p0 and w1_p0 (2 pieces removed at the bottom of column 0)
    grid[0][0].isRemoved = true;
    grid[1][0].isRemoved = true;

    const result = calculateGravityShift(axle, GravityType.Down);
    expect(result.hasAnyShift).toBe(true);
    expect(result.actions.length).toBe(5); // 3 shifts down + 2 new spawns at top

    // w2_p0 drops to w0_p0 (steps = 2)
    const action0 = result.actions.find((a) => a.targetPiece.id === 'w0_p0');
    expect(action0?.isNewSpawn).toBe(false);
    expect(action0?.sourcePiece?.id).toBe('w2_p0');
    expect(action0?.steps).toBe(2);

    // w3_p0 drops to w1_p0 (steps = 2)
    const action1 = result.actions.find((a) => a.targetPiece.id === 'w1_p0');
    expect(action1?.isNewSpawn).toBe(false);
    expect(action1?.sourcePiece?.id).toBe('w3_p0');
    expect(action1?.steps).toBe(2);

    // w4_p0 drops to w2_p0 (steps = 2)
    const action2 = result.actions.find((a) => a.targetPiece.id === 'w2_p0');
    expect(action2?.isNewSpawn).toBe(false);
    expect(action2?.sourcePiece?.id).toBe('w4_p0');
    expect(action2?.steps).toBe(2);

    // w3_p0 is new spawn
    const action3 = result.actions.find((a) => a.targetPiece.id === 'w3_p0');
    expect(action3?.isNewSpawn).toBe(true);
    expect(action3?.steps).toBe(2);

    // w4_p0 is new spawn
    const action4 = result.actions.find((a) => a.targetPiece.id === 'w4_p0');
    expect(action4?.isNewSpawn).toBe(true);
    expect(action4?.steps).toBe(3);
  });

  it('should calculate Up gravity shifts and bottom spawns correctly', () => {
    const { axle, grid } = buildGrid(5, 8);
    // Remove w4_p0 and w3_p0 (2 pieces removed at the top of column 0)
    grid[4][0].isRemoved = true;
    grid[3][0].isRemoved = true;

    const result = calculateGravityShift(axle, GravityType.Up);
    expect(result.hasAnyShift).toBe(true);
    expect(result.actions.length).toBe(5); // 3 shifts up + 2 new spawns at bottom

    // w2_p0 rises to w4_p0 (steps = -2)
    const action4 = result.actions.find((a) => a.targetPiece.id === 'w4_p0');
    expect(action4?.isNewSpawn).toBe(false);
    expect(action4?.sourcePiece?.id).toBe('w2_p0');
    expect(action4?.steps).toBe(-2);

    // w1_p0 rises to w3_p0 (steps = -2)
    const action3 = result.actions.find((a) => a.targetPiece.id === 'w3_p0');
    expect(action3?.isNewSpawn).toBe(false);
    expect(action3?.sourcePiece?.id).toBe('w1_p0');
    expect(action3?.steps).toBe(-2);

    // w0_p0 rises to w2_p0 (steps = -2)
    const action2 = result.actions.find((a) => a.targetPiece.id === 'w2_p0');
    expect(action2?.isNewSpawn).toBe(false);
    expect(action2?.sourcePiece?.id).toBe('w0_p0');
    expect(action2?.steps).toBe(-2);

    // w0_p0 and w1_p0 are new spawns
    const action0 = result.actions.find((a) => a.targetPiece.id === 'w0_p0');
    expect(action0?.isNewSpawn).toBe(true);

    const action1 = result.actions.find((a) => a.targetPiece.id === 'w1_p0');
    expect(action1?.isNewSpawn).toBe(true);
  });
});
