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
