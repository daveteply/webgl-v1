import { MathUtils } from 'three';

// Drawing the cylindrical grid
export const GRID_RADIUS = 6.5;
export const GRID_STEP_DEGREES = 10;
export const GRID_MAX_DEGREES = 360;
export const GRID_VERTICAL_OFFSET = 1.05;
export const ROTATIONAL_CONSTANT = 75;
export const WHEEL_START_POSITION = 50;

// Establish single "step" around the radian circle
export const GRID_INC = MathUtils.degToRad(GRID_STEP_DEGREES);
// rotation
const QUARTER_CIRCLE_DEGREES = 90;
export const QUARTER_CIRCLE_RADIANS = MathUtils.degToRad(QUARTER_CIRCLE_DEGREES);

// Math related constants
export const TWO_PI = 2 * Math.PI;
export const HALF_PI = Math.PI / 2;
export const DECIMAL_COMPARISON_TOLERANCE = 0.001;

// Game rules
export const DEFAULT_PLAYABLE_TEXTURE_COUNT = 6;
export const MINIMUM_MATCH_COUNT = 3;
// this is used with the target piece count along with a
// logarithmic function to slowly increase as the player
//  progresses through each level
export const LEVEL_ADDITIVE = 3;
export const MINIMUM_SPEED_BONUS = 800;
export const LONG_MATCH_SCORE_MULTIPLIER = 10;
export const POWER_MOVE_USE_SCORE_MULTIPLIER = 50;
export const MOVES_REMAINING_COUNT_WARNING = 3;
export const MOVES_REMAINING_COUNT_DANGER = 2;
export const MOVES_REMAINING_COUNT_PANIC = 1;
export const LEVEL_START_OTHER_GEOMETRIES = 3;
export const DIFFICULTY_TIER_1 = 10;
export const DIFFICULTY_TIER_2 = 20;
export const DIFFICULTY_TIER_3 = 30;
export const DIFFICULTY_TIER_4 = 50;

// sharing
export const SHARE_FILE_NAME = 'rikkle-screen-shot.png';
export const SHARE_WEBSITE = 'https://turbogeekbear.com/projects/rikkle/story';

// Storage
export const STORAGE_HIGH_SCORES = 'High.Scores';
export const STORAGE_HINT_HOW_TO_PLAY = 'Hint.HowToPlay';
export const STORAGE_HINT_MOVES_DECREASE = 'Hint.Moves.Decrease';
export const STORAGE_HINT_MOVES_INCREASE = 'Hint.Moves.Increase';
export const STORAGE_SAVE_STATE = 'Save.State';

// Ads
export const LEVEL_START_POSSIBLE_ADS = 3;
export const LEVEL_START_FULL_ADS = 8;

// Misc
export const CANVAS_TEXTURE_SCALE = 80;
export const RAINBOW_COLOR_ARRAY = [0xff0000, 0xffa500, 0xffff00, 0x008000, 0x0000ff, 0x800080];
export const DARK_RAINBOW_COLOR_ARRAY = [0x510000, 0x401a00, 0x353600, 0x002f01, 0x000a3e];
export const DIFFICULT_LEVEL_COLOR = [0xffffff, 0x00d4cf, 0x8000ff, 0xff0080];
export const GAME_OVER_EMOJI = [0x1f97a, 0x1f627, 0x1f625, 0x1f616, 0x1f62b];
export const EMOJI_GROUP_PEOPLE_BODY = 'People & Body';
export const EMOJI_GROUP_SMILEYS_EMOTION = 'Smileys & Emotion';
export const EMOJI_GROUP_STEP = 6;
export const LEVEL_COMPLETE_HEADINGS = ['Level Completed!', 'Great Moves!', 'Solved!', 'Well Done!'];
export const UV_SIDES = [
  [1, 0, 0, 0, 1, 1, 0, 1], // back (rotate PI)
  [0, 1, 1, 1, 0, 0, 1, 0], // front (keep original)
  [0, 0, 0, 1, 1, 0, 1, 1], // top (rotate PI/2)
  [1, 1, 1, 0, 0, 1, 0, 0], // bottom (rotate -PI/2)
  [0, 1, 1, 1, 0, 0, 1, 0], // side (keep original)
  [0, 1, 1, 1, 0, 0, 1, 0], // side (keep original)
];
