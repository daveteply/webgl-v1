import { MathUtils } from 'three';

// drawing the grid
export const GRID_RADIUS = 6.5;
export const GRID_STEP_DEGREES = 10;
export const GRID_MAX_DEGREES = 360;
export const GRID_VERTICAL_OFFSET = 1.05;
export const ROTATIONAL_CONSTANT = 75;
export const WHEEL_START_POSITION = 50;

// establish single "step" around the radian circle
export const GRID_INC = MathUtils.degToRad(GRID_STEP_DEGREES);
// rotation
const QUARTER_CIRCLE_DEGREES = 90;
export const QUARTER_CIRCLE_RADIANS = MathUtils.degToRad(
  QUARTER_CIRCLE_DEGREES
);

// math related constants
export const TWO_PI = 2 * Math.PI;
export const DECIMAL_COMPARISON_TOLERANCE = 0.001;

// game rules
export const PLAYABLE_PIECE_COUNT = 6;
export const MINIMUM_MATCH_COUNT = 3;
export const LEVEL_COMPLETION_MULTIPLIER = 5;
export const LEVEL_START_MOVE_MULTIPLIER = 2;
