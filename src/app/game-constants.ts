import { MathUtils } from 'three';

export const GRID_RADIUS = 7;
export const GRID_STEP_DEGREES = 10;
export const GRID_MAX_DEGREES = 360;
export const ROTATIONAL_CONSTANT = 75;

export const COLOR_COUNT = 5;

// establish single "step" around the radian circle
export const GRID_INC = MathUtils.degToRad(GRID_STEP_DEGREES);

export const TWO_PI = 2 * Math.PI;
