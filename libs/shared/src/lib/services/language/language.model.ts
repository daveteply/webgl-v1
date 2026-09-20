export interface SupportedLanguage {
  code: string;
  label: string; // Native name (endonym), e.g. English, Español, Deutsch, Français, 日本語
  fontAsset: string;
  localeId: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', label: 'English', fontAsset: 'fonts/typeface/Changa_Regular.json', localeId: 'en-US' },
  { code: 'es', label: 'Español', fontAsset: 'fonts/typeface/Changa_Regular.json', localeId: 'es-ES' },
  { code: 'de', label: 'Deutsch', fontAsset: 'fonts/typeface/Changa_Regular.json', localeId: 'de-DE' },
  {
    code: 'fr',
    label: 'Français',
    fontAsset: 'fonts/typeface/Changa_Regular.json',
    localeId: 'fr-FR',
  },
  { code: 'ja', label: '日本語', fontAsset: 'fonts/typeface/NotoSansJP_Regular.json', localeId: 'ja-JP' },
];

export const DEFAULT_LANGUAGE = 'en';
export const STORAGE_KEY_LANGUAGE = 'Settings.Language';
