export interface SupportedLanguage {
  code: string;
  label: string;
  flagEmoji: string;
  fontAsset: string;
  localeId: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', label: 'English', flagEmoji: '🇺🇸', fontAsset: 'fonts/typeface/Changa_Regular.json', localeId: 'en-US' },
  { code: 'es', label: 'Español', flagEmoji: '🇪🇸', fontAsset: 'fonts/typeface/Changa_Regular.json', localeId: 'es-ES' },
  { code: 'de', label: 'Deutsch', flagEmoji: '🇩🇪', fontAsset: 'fonts/typeface/Changa_Regular.json', localeId: 'de-DE' },
  {
    code: 'fr',
    label: 'Français',
    flagEmoji: '🇫🇷',
    fontAsset: 'fonts/typeface/Changa_Regular.json',
    localeId: 'fr-FR',
  },
  { code: 'ja', label: '日本語', flagEmoji: '🇯🇵', fontAsset: 'fonts/typeface/Changa_Regular.json', localeId: 'ja-JP' },
];

export const DEFAULT_LANGUAGE = 'en';
export const STORAGE_KEY_LANGUAGE = 'Settings.Language';
