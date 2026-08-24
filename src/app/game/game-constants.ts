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
export const PLAYABLE_TEXTURE_COUNT = 6;
export const MINIMUM_MATCH_COUNT = 3;
// this is used with the target piece count along with a
// logarithmic function to slowly increase as the player
//  progresses through each level
export const LEVEL_ADDITIVE = 3;
export const MINIMUM_SPEED_BONUS = 800;
export const LONG_MATCH_SCORE_MULTIPLIER = 10;
export const POWER_MOVE_USE_SCORE_MULTIPLIER = 50;
export const PERFECT_MATCH_SCORE_MULTIPLIER = 100;
export const MOVES_REMAINING_COUNT_WARNING = 3;
export const MOVES_REMAINING_COUNT_DANGER = 2;
export const MOVES_REMAINING_COUNT_PANIC = 2;
export const LEVEL_START_CYLINDER = 7;
export const LEVEL_START_DODECAHEDRON = 12;

// Feature Unlock Levels
export const POWER_MOVE_START_LEVEL = 3;
export const POWER_MOVE_START_VERTICAL = 6;
export const POWER_MOVE_START_MIX = 9;
export const POWER_MOVE_START_BOMB = 12;
export const GRAVITY_START_DOWN = 6;
export const GRAVITY_START_UP = 10;
export const GRAVITY_START_MIX = 14;
export const MATERIAL_START_COLOR = 3;
export const MATERIAL_START_BUMP = 5;
export const MATERIAL_START_EMOJI = 9;
export const HORIZONTAL_LEVEL_START_LEVEL = 2;
export const HORIZONTAL_TURN_DURATION = 3000;
export const CAMERA_HORIZONTAL_OFFSET = -0.6;
export const CAMERA_PAN_MAX_OFFSET = 2.4;

export const DIFFICULTY_TIER_1 = 10;
export const DIFFICULTY_TIER_2 = 20;
export const DIFFICULTY_TIER_3 = 30;
export const DIFFICULTY_TIER_4 = 50;

// sharing
export const SHARE_FILE_NAME = 'rikkle-screen-shot.png';
// export const SHARE_WEBSITE = 'https://turbogeekbear.com/projects/rikkle/story';

// Storage
export const STORAGE_HIGH_SCORES = 'High.Scores';
export const STORAGE_HINT_HOW_TO_PLAY = 'Hint.HowToPlay';
export const STORAGE_HINT_ROTATE_HORIZONTAL = 'Hint.RotateHorizontal';
export const STORAGE_HINT_ROTATE_VERTICAL = 'Hint.RotateVertical';
export const STORAGE_HINT_MOVES_DECREASE = 'Hint.Moves.Decrease';
export const STORAGE_HINT_MOVES_INCREASE = 'Hint.Moves.Increase';
export const STORAGE_HINT_POWER_MOVE = 'Hint.PowerMove';
export const STORAGE_HINT_GAME_MENU = 'Hint.GameMenu';
export const STORAGE_SAVE_STATE = 'Save.State';
export const STORAGE_SETTINGS_GAME_VOLUME = 'Settings.GameVolume';
export const STORAGE_SETTINGS_MUSIC_VOLUME = 'Settings.MusicVolume';
export const TUTORIAL_IDLE_DELAY_MS = 2000;

// Ads
// export const LEVEL_START_POSSIBLE_ADS = 3;
// export const LEVEL_START_FULL_ADS = 8;

// Misc
export const CANVAS_TEXTURE_SCALE = 80;
export const RAINBOW_COLOR_ARRAY = [0xff0000, 0xffa500, 0xffff00, 0x008000, 0x0000ff, 0x800080];
export const DARK_RAINBOW_COLOR_ARRAY = [0x510000, 0x401a00, 0x353600, 0x002f01, 0x000a3e];
export const GAME_OVER_EMOJI = [0x1f97a, 0x1f627, 0x1f625, 0x1f616, 0x1f62b];
export const EMOJI_GROUP_PEOPLE_BODY = 'People & Body';
export const EMOJI_GROUP_SMILEYS_EMOTION = 'Smileys & Emotion';
export const EMOJI_GROUP_STEP = 6;
export const LEVEL_COMPLETE_HEADINGS = ['Level Completed!', 'Great Moves!', 'Solved!', 'Well Done!'];
export const BUMP_SCALE = 5;
export const UV_SIDES = [
  [1, 0, 0, 0, 1, 1, 0, 1], // back (rotate PI)
  [0, 1, 1, 1, 0, 0, 1, 0], // front (keep original)
  [0, 0, 0, 1, 1, 0, 1, 1], // top (rotate PI/2)
  [1, 1, 1, 0, 0, 1, 0, 0], // bottom (rotate -PI/2)
  [0, 1, 1, 1, 0, 0, 1, 0], // side (keep original)
  [0, 1, 1, 1, 0, 0, 1, 0], // side (keep original)
];
