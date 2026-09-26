import { describe, it, expect } from 'vitest';
import { calculateLevelConfiguration, calculateLevelTransitionType } from './level-rules';
import { LevelGeometryType } from '../models/level-geometry-type';
import { LevelMaterialType } from '../models/level-material-type';
import { GravityType } from '../models/gravity-type';
import { LevelOrientationType } from '../models/level-orientation-type';
import { LevelTransitionType } from '../models/level-transition-type';
import { LEVEL_COMPLETE_HEADING_KEYS } from '../game-constants';

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

  it('should introduce materials progressively: Color at level 3, BumpMaterial at level 4, and Emoji at level 5+', () => {
    // Level 1-2: only ColorBumpShape
    for (let l = 1; l <= 2; l++) {
      const config = calculateLevelConfiguration(l, () => 0.99, { orientationOverride: LevelOrientationType.Vertical });
      expect(config.materialType).toBe(LevelMaterialType.ColorBumpShape);
    }

    // Level 3: ColorBumpShape or Color
    const l3Materials = new Set<LevelMaterialType>();
    l3Materials.add(
      calculateLevelConfiguration(3, () => 0.0, { orientationOverride: LevelOrientationType.Vertical }).materialType,
    );
    l3Materials.add(
      calculateLevelConfiguration(3, () => 0.99, { orientationOverride: LevelOrientationType.Vertical }).materialType,
    );
    expect(l3Materials.has(LevelMaterialType.ColorBumpShape)).toBe(true);
    expect(l3Materials.has(LevelMaterialType.Color)).toBe(true);
    expect(l3Materials.has(LevelMaterialType.ColorBumpMaterial)).toBe(false);
    expect(l3Materials.has(LevelMaterialType.Emoji)).toBe(false);

    // Level 4: adds ColorBumpMaterial
    const l4Materials = new Set<LevelMaterialType>();
    l4Materials.add(
      calculateLevelConfiguration(4, () => 0.0, { orientationOverride: LevelOrientationType.Vertical }).materialType,
    );
    l4Materials.add(
      calculateLevelConfiguration(4, () => 0.5, { orientationOverride: LevelOrientationType.Vertical }).materialType,
    );
    l4Materials.add(
      calculateLevelConfiguration(4, () => 0.99, { orientationOverride: LevelOrientationType.Vertical }).materialType,
    );
    expect(l4Materials.has(LevelMaterialType.ColorBumpMaterial)).toBe(true);
    expect(l4Materials.has(LevelMaterialType.Emoji)).toBe(false);

    // Level 5+: vertical non-dodecahedron can select Emoji
    const l5Config = calculateLevelConfiguration(5, () => 0.99, {
      orientationOverride: LevelOrientationType.Vertical,
      geometryOverride: LevelGeometryType.Cube,
    });
    expect(l5Config.materialType).toBe(LevelMaterialType.Emoji);
  });

  it('should give Emoji material 40% weight on vertical non-dodecahedron levels', () => {
    let emojiCount = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      const config = calculateLevelConfiguration(5, () => i / trials, {
        orientationOverride: LevelOrientationType.Vertical,
        geometryOverride: LevelGeometryType.Cube,
      });
      if (config.materialType === LevelMaterialType.Emoji) {
        emojiCount++;
      }
    }
    expect(emojiCount).toBe(400);
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

  it('should verify LEVEL_COMPLETE_HEADING_KEYS translation keys', () => {
    expect(LEVEL_COMPLETE_HEADING_KEYS.length).toBeGreaterThan(0);
    expect(LEVEL_COMPLETE_HEADING_KEYS).toContain('HEADINGS.SOLVED');
  });
});
