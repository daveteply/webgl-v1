import { describe, it, expect } from 'vitest';
import { calculateLevelConfiguration, calculateLevelTransitionType } from './level-rules';
import { LevelGeometryType } from '../../models/level-geometry-type';
import { LevelMaterialType } from '../../models/level-material-type';
import { GravityType } from '../../models/gravity-type';
import { LevelOrientationType } from '../../models/level-orientation-type';
import { LevelTransitionType } from '../../services/level-transition-type';

describe('level-rules', () => {
  it('should initialize level 1 with Cube, ColorBumpShape, No Gravity, and Vertical orientation', () => {
    const config = calculateLevelConfiguration(1, () => 0);
    expect(config.geometryType).toBe(LevelGeometryType.Cube);
    expect(config.materialType).toBe(LevelMaterialType.ColorBumpShape);
    expect(config.gravityType).toBe(GravityType.None);
    expect(config.orientation).toBe(LevelOrientationType.Vertical);
    expect(config.isHorizontal).toBe(false);
  });

  it('should respect feature flag overrides', () => {
    const config = calculateLevelConfiguration(1, () => 0, {
      geometryOverride: LevelGeometryType.Dodecahedron,
      materialOverride: LevelMaterialType.Emoji,
      gravityOverride: GravityType.Mix,
      orientationOverride: LevelOrientationType.HorizontalRight,
    });
    expect(config.geometryType).toBe(LevelGeometryType.Dodecahedron);
    expect(config.materialType).toBe(LevelMaterialType.Emoji);
    expect(config.gravityType).toBe(GravityType.Mix);
    expect(config.orientation).toBe(LevelOrientationType.HorizontalRight);
    expect(config.isHorizontal).toBe(true);
  });

  it('should not assign Emoji material to Dodecahedron geometry or Horizontal orientation', () => {
    // High level (level 20), seeded RNG returning index for Emoji
    const rng = () => 0.99; // Would hit Emoji if allowed
    const configDodeca = calculateLevelConfiguration(20, rng, {
      geometryOverride: LevelGeometryType.Dodecahedron,
    });
    expect(configDodeca.materialType).not.toBe(LevelMaterialType.Emoji);

    const configHoriz = calculateLevelConfiguration(20, rng, {
      orientationOverride: LevelOrientationType.HorizontalLeft,
    });
    expect(configHoriz.materialType).not.toBe(LevelMaterialType.Emoji);
  });

  it('should calculate level transition types based on level tier', () => {
    expect(calculateLevelTransitionType(1)).toBe(LevelTransitionType.Default);
    expect(calculateLevelTransitionType(3)).toBe(LevelTransitionType.Default);

    // Levels 4-6 have 2 types (Default or Bokeh)
    const t4 = calculateLevelTransitionType(5, () => 0.6);
    expect([LevelTransitionType.Default, LevelTransitionType.Bokeh]).toContain(t4);

    // Levels 7+ have 3 types (Default, Bokeh, UnrealBloom)
    const t7 = calculateLevelTransitionType(8, () => 0.9);
    expect(t7).toBe(LevelTransitionType.UnrealBloom);
  });
});
