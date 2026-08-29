import {
  GRAVITY_START_DOWN,
  GRAVITY_START_MIX,
  GRAVITY_START_UP,
  HORIZONTAL_LEVEL_START_LEVEL,
  LEVEL_START_CYLINDER,
  LEVEL_START_DODECAHEDRON,
  MATERIAL_START_BUMP,
  MATERIAL_START_COLOR,
  MATERIAL_START_EMOJI,
} from '../../game-constants';
import { GravityType } from '../../models/gravity-type';
import { LevelGeometryType } from '../../models/level-geometry-type';
import { LevelMaterialType } from '../../models/level-material-type';
import { LevelOrientationType } from '../../models/level-orientation-type';
import { LevelTransitionType } from '../../services/level-transition-type';

export interface LevelConfiguration {
  geometryType: LevelGeometryType;
  materialType: LevelMaterialType;
  gravityType: GravityType;
  orientation: LevelOrientationType;
  isHorizontal: boolean;
}

export interface LevelRuleOverrides {
  geometryOverride?: LevelGeometryType | null;
  materialOverride?: LevelMaterialType | null;
  gravityOverride?: GravityType | null;
  orientationOverride?: LevelOrientationType | null;
}

/**
 * Pure generator of level parameters based on level number and deterministic RNG.
 */
export function calculateLevelConfiguration(
  level: number,
  rng: () => number = Math.random,
  overrides?: LevelRuleOverrides,
): LevelConfiguration {
  // Geometry
  let geometryType = LevelGeometryType.Cube;
  if (level >= LEVEL_START_CYLINDER && Math.floor(rng() * 2) === 0) {
    if (level >= LEVEL_START_DODECAHEDRON) {
      const otherGeoRoll = Math.floor(rng() * 2);
      geometryType = otherGeoRoll === 0 ? LevelGeometryType.Cylinder : LevelGeometryType.Dodecahedron;
    } else {
      geometryType = LevelGeometryType.Cylinder;
    }
  }

  // Orientation
  let orientation = LevelOrientationType.Vertical;
  if (level >= HORIZONTAL_LEVEL_START_LEVEL) {
    const isHoriz = Math.floor(rng() * 2) === 1;
    if (isHoriz) {
      orientation =
        Math.floor(rng() * 2) === 0 ? LevelOrientationType.HorizontalRight : LevelOrientationType.HorizontalLeft;
    }
  }

  const isHorizontal = orientation !== LevelOrientationType.Vertical;

  // Material
  let materialType: LevelMaterialType;
  if (level < MATERIAL_START_COLOR) {
    materialType = LevelMaterialType.ColorBumpShape;
  } else if (level < MATERIAL_START_BUMP) {
    const level4Materials = [LevelMaterialType.ColorBumpShape, LevelMaterialType.Color];
    materialType = level4Materials[Math.floor(rng() * level4Materials.length)];
  } else if (level < MATERIAL_START_EMOJI) {
    const level8Materials = [
      LevelMaterialType.ColorBumpShape,
      LevelMaterialType.Color,
      LevelMaterialType.ColorBumpMaterial,
    ];
    materialType = level8Materials[Math.floor(rng() * level8Materials.length)];
  } else {
    const allMaterials =
      geometryType === LevelGeometryType.Dodecahedron || isHorizontal
        ? [LevelMaterialType.ColorBumpShape, LevelMaterialType.Color, LevelMaterialType.ColorBumpMaterial]
        : [
            LevelMaterialType.ColorBumpShape,
            LevelMaterialType.Color,
            LevelMaterialType.ColorBumpMaterial,
            LevelMaterialType.Emoji,
          ];
    materialType = allMaterials[Math.floor(rng() * allMaterials.length)];
  }

  // Gravity
  let gravityType: GravityType;
  if (level < GRAVITY_START_DOWN) {
    gravityType = GravityType.None;
  } else if (level < GRAVITY_START_UP) {
    const gravityOptions = [GravityType.None, GravityType.Down];
    gravityType = gravityOptions[Math.floor(rng() * gravityOptions.length)];
  } else if (level < GRAVITY_START_MIX) {
    const gravityOptions = [GravityType.None, GravityType.Down, GravityType.Up];
    gravityType = gravityOptions[Math.floor(rng() * gravityOptions.length)];
  } else {
    const gravityOptions = [GravityType.None, GravityType.Down, GravityType.Up, GravityType.Mix];
    gravityType = gravityOptions[Math.floor(rng() * gravityOptions.length)];
  }

  // Apply overrides if provided
  if (overrides?.geometryOverride !== null && overrides?.geometryOverride !== undefined) {
    geometryType = overrides.geometryOverride;
  }
  if (overrides?.materialOverride !== null && overrides?.materialOverride !== undefined) {
    materialType = overrides.materialOverride;
  }
  if (overrides?.orientationOverride !== null && overrides?.orientationOverride !== undefined) {
    orientation = overrides.orientationOverride;
  }
  if (overrides?.gravityOverride !== null && overrides?.gravityOverride !== undefined) {
    gravityType = overrides.gravityOverride;
  }

  return {
    geometryType,
    materialType,
    gravityType,
    orientation,
    isHorizontal: orientation !== LevelOrientationType.Vertical,
  };
}

/**
 * Pure generator of level transition animation type.
 */
export function calculateLevelTransitionType(level?: number, rng: () => number = Math.random): LevelTransitionType {
  if (level !== undefined && level <= 3) {
    return LevelTransitionType.Default;
  } else if (level !== undefined && level <= 6) {
    return Math.floor(rng() * 2) as LevelTransitionType;
  } else {
    return Math.floor(rng() * 3) as LevelTransitionType;
  }
}
