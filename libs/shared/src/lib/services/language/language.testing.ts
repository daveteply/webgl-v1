import { EnvironmentProviders } from '@angular/core';
import { provideTransloco, TranslocoConfig } from '@jsverse/transloco';
import { SUPPORTED_LANGUAGES } from './language.model';

export const TRANSLOCO_TESTING_CONFIG: Partial<TranslocoConfig> = {
  availableLangs: SUPPORTED_LANGUAGES.map((l) => l.code),
  defaultLang: 'en',
  reRenderOnLangChange: true,
};

/**
 * Centralized Transloco provider helper for unit testing.
 * Uses SUPPORTED_LANGUAGES by default and can be customized per test suite.
 */
export function provideTranslocoTesting(config: Partial<TranslocoConfig> = {}): EnvironmentProviders[] {
  return provideTransloco({
    config: {
      ...TRANSLOCO_TESTING_CONFIG,
      ...config,
    },
  });
}
