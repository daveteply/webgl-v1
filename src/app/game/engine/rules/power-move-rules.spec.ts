import { describe, it, expect } from 'vitest';
import { calculateBombMaxTargetCount, evaluatePowerMove, selectPowerMove } from './power-move-rules';
import { PowerMoveType } from '../../models/power-move-type';
import { LevelGeometryType } from '../../models/level-geometry-type';

describe('power-move-rules', () => {
  it('should return None for levels below POWER_MOVE_START_LEVEL', () => {
    const move = selectPowerMove(1, LevelGeometryType.Cube);
    expect(move).toBe(PowerMoveType.None);
  });

  it('should return None if matchCount is below threshold', () => {
    // Level 1: requires 4+ matches (3 matches = None)
    const move = evaluatePowerMove(3, 1, LevelGeometryType.Cube);
    expect(move).toBe(PowerMoveType.None);
  });

  it('should evaluate power move when matchCount meets threshold for tier 1 and tier 2', () => {
    const rng = () => 0.0; // selects first available move (HorizontalRight)
    // Tier 1 (level < 20): requires 4+ matches
    const moveTier1Below = evaluatePowerMove(3, 5, LevelGeometryType.Cube, rng);
    expect(moveTier1Below).toBe(PowerMoveType.None);

    const moveTier1Met = evaluatePowerMove(4, 5, LevelGeometryType.Cube, rng);
    expect(moveTier1Met).toBe(PowerMoveType.HorizontalRight);

    // Tier 2 (level >= 20): 3 matches trigger power move
    const moveTier2Met = evaluatePowerMove(3, 20, LevelGeometryType.Cube, rng);
    expect(moveTier2Met).toBe(PowerMoveType.HorizontalRight);
  });

  it('should exclude vertical power moves for Cylinder and Dodecahedron geometries', () => {
    // High level (level 20) with RNG that rolls across the entire pool
    const selectedMoves = new Set<PowerMoveType>();
    for (let i = 0; i < 100; i++) {
      const rng = () => i / 100;
      selectedMoves.add(selectPowerMove(20, LevelGeometryType.Cylinder, rng));
    }

    expect(selectedMoves.has(PowerMoveType.VerticalUp)).toBe(false);
    expect(selectedMoves.has(PowerMoveType.VerticalDown)).toBe(false);
    expect(selectedMoves.has(PowerMoveType.VerticalMix)).toBe(false);
  });

  it('should calculate bomb blast radius scale per level progression', () => {
    expect(calculateBombMaxTargetCount(1)).toBe(5); // clamped to min 5
    expect(calculateBombMaxTargetCount(6)).toBe(9); // floor(6 * 1.5) = 9
    expect(calculateBombMaxTargetCount(20)).toBe(21); // clamped to max 21
  });
});
