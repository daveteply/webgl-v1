import { MathUtils } from 'three';

export const GRID_RADIUS = 8;
export const GRID_STEP_DEGREES = 8;
export const GRID_MAX_DEGREES = 360;
export const GRID_VERTICLE_OFFSET = 1.05;
export const ROTATIONAL_CONSTANT = 75;

export const COLOR_COUNT = 5;

// establish single "step" around the radian circle
export const GRID_INC = MathUtils.degToRad(GRID_STEP_DEGREES);

// math related constants
export const TWO_PI = 2 * Math.PI;
export const DECIMAL_COMPARISON_TOLERANCE = 0.001;
