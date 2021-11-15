import { MathUtils } from 'three';

export const GRID_RADIUS = 7;
export const GRID_ITERATION = 10;
export const ROTATIONAL_CONSTANT = 75;

// establish single "step" around the radian circle
export const GRID_INC = MathUtils.degToRad(GRID_ITERATION);

export const TWO_PI = 2 * Math.PI;
