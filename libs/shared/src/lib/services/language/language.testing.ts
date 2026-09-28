import { EnvironmentProviders, inject, provideEnvironmentInitializer } from '@angular/core';
import { TranslocoConfig, TranslocoService, provideTransloco } from '@jsverse/transloco';
import { SUPPORTED_LANGUAGES } from './language.model';

export const TRANSLOCO_TESTING_CONFIG: Partial<TranslocoConfig> = {
  availableLangs: SUPPORTED_LANGUAGES.map((l) => l.code),
  defaultLang: 'en',
  reRenderOnLangChange: true,
};

export const DEFAULT_TEST_TRANSLATIONS: Record<string, unknown> = {
  APP: {
    TITLE: 'Rikkle',
    DESCRIPTION: 'A 3D puzzle game',
  },
  HEADINGS: {
    LEVEL_COMPLETED: 'Level Completed!',
    GREAT_MOVES: 'Great Moves!',
    SOLVED: 'Solved!',
    WELL_DONE: 'Well Done!',
  },
  SPLASH_3D: {
    PERFECT_MATCH: 'Perfect Match!',
    POINTS_REWARD: '+{{ points }} Points',
    SPEED_BONUS: 'Speed Bonus',
    LONG_MATCH: 'Long Match',
    MULTI_POWER: 'Multi-Power!',
    BONUS_MOVES: '+{{ count }} Move',
    CALLOUT_LIGHTNING: 'LIGHTNING!',
    CALLOUT_BLAZING: 'BLAZING!',
    CALLOUT_FAST: 'FAST!',
    CALLOUT_SNAP: 'SNAP!',
    CALLOUT_QUICK: 'QUICK!',
    CALLOUT_MEGA_COMBO: 'MEGA COMBO!',
    CALLOUT_AWESOME: 'AWESOME!',
    CALLOUT_GREAT: 'GREAT!',
    CALLOUT_NICE: 'NICE!',
    COMBO_MEGA: 'Mega Combo',
    COMBO_SPEED: 'Super Speed',
  },
  POWER_MOVES: {
    SPIN_RIGHT: 'Spin right',
    SPIN_LEFT: 'Spin left',
    ROTATE_RIGHT: 'Rotate right',
    ROTATE_LEFT: 'Rotate left',
    ROTATE_UP: 'Rotate up',
    ROTATE_DOWN: 'Rotate down',
    BOMB: 'Bomb',
    KABOOM: 'Kaboom',
    RAINBOW_SPECIAL: 'Rainbow special',
  },
  SETTINGS: {
    TITLE: 'User Settings',
    TAB_GENERAL: 'General',
    TAB_DATA: 'Game Data',
    LANGUAGE: 'Language',
    HAPTICS: 'Haptic Feedback',
    HAPTICS_UNAVAILABLE: 'Haptic feedback is not available',
  },
  HUD: {
    LEVEL: 'Level',
    SCORE: 'Score',
    MOVES: 'Moves',
    POINTS: 'Points',
    PIECES_REMAINING: '{{ count }} remaining',
  },
  BUTTONS: {
    CONTINUE: 'Continue',
    PLAY_AGAIN: 'Play Again',
    NEXT_LEVEL: 'Next Level',
    CLOSE: 'Close',
    SHARE: 'Share',
  },
  SHARE: {
    CANVAS_LEVEL: 'Level: {{ level }}',
    CANVAS_SCORE: 'Score: {{ score }}',
    SOCIAL_TITLE: 'Rikkle - 3D Match Puzzle',
    SOCIAL_TEXT_SCORE: 'Can you beat my score of {{ score }} on Level {{ level }}? Play Rikkle: {{ url }}',
    SOCIAL_TEXT_SCORE_2:
      'Sitting on {{ score }} points at Level {{ level }} in Rikkle! Think you can top that? {{ url }}',
    SOCIAL_TEXT_SCORE_3: 'On a roll in Rikkle! Just hit {{ score }} on Level {{ level }}. Try it out: {{ url }}',
    SOCIAL_TEXT_SCORE_4:
      'Level {{ level }} down, {{ score }} points on the board! Who can beat this in Rikkle? {{ url }}',
    SOCIAL_TEXT_DEFAULT: 'Check out Rikkle, the 3D cylinder match puzzle! Play now: {{ url }}',
    SOCIAL_TEXT_DEFAULT_2: 'Spin, match, and clear! Dive into Rikkle, the 3D puzzle challenge: {{ url }}',
    SOCIAL_TEXT_DEFAULT_3: 'Loving this 3D cylinder matching puzzle. Give Rikkle a spin! {{ url }}',
    SOCIAL_TEXT_DEFAULT_4: 'Ready to rotate and match? Play Rikkle free in your browser: {{ url }}',
    SOCIAL_TEXT_LEVEL_COMPLETE:
      'Just cleared Level {{ level }} in Rikkle with a {{ fastest }}s fastest match! Score: {{ score }}. Play now: {{ url }}',
    SOCIAL_TEXT_LEVEL_COMPLETE_2:
      'Level {{ level }} crushed! Scored {{ score }} with a {{ fastest }}s blitz match. Can you beat that in Rikkle? {{ url }}',
    SOCIAL_TEXT_LEVEL_COMPLETE_3:
      'Victory on Level {{ level }}! 🧩 Clocked a {{ fastest }}s match and scored {{ score }}. Jump into Rikkle: {{ url }}',
    SOCIAL_TEXT_LEVEL_COMPLETE_4:
      'Cracked Level {{ level }} in Rikkle! Finished with {{ score }} pts (fastest match: {{ fastest }}s). Can you match this? {{ url }}',
  },
};

/**
 * Centralized Transloco provider helper for unit testing.
 * Preloads DEFAULT_TEST_TRANSLATIONS by default and initializes Transloco synchronously in TestBed.
 */
export function provideTranslocoTesting(
  config: Partial<TranslocoConfig> = {},
  translations: Record<string, unknown> = DEFAULT_TEST_TRANSLATIONS,
): EnvironmentProviders[] {
  return [
    ...provideTransloco({
      config: {
        ...TRANSLOCO_TESTING_CONFIG,
        ...config,
      },
    }),
    provideEnvironmentInitializer(() => {
      const transloco = inject(TranslocoService);
      transloco.setTranslation(translations, 'en');
      transloco.setActiveLang('en');
    }),
  ];
}
