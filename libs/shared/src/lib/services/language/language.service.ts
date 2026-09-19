import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { StorageService } from '../storage/storage.service';
import { DEFAULT_LANGUAGE, STORAGE_KEY_LANGUAGE, SUPPORTED_LANGUAGES, SupportedLanguage } from './language.model';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private transloco = inject(TranslocoService);
  private storage = inject(StorageService);

  readonly availableLanguages = signal<SupportedLanguage[]>(SUPPORTED_LANGUAGES);
  readonly currentLanguageCode = signal<string>(DEFAULT_LANGUAGE);
  readonly currentLanguage = computed<SupportedLanguage>(
    () => this.availableLanguages().find((l) => l.code === this.currentLanguageCode()) ?? this.availableLanguages()[0],
  );

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    const initialLang = this.resolveInitialLanguage();
    this.setLanguage(initialLang, false);
  }

  public resolveInitialLanguage(): string {
    // 1. Check storage for explicit user choice
    const saved = this.storage.getItem<string>(STORAGE_KEY_LANGUAGE);
    if (saved && this.isSupported(saved)) {
      return saved;
    }

    // 2. Multi-locale browser resolution (e.g. ca-EN vs ca-FR, ja-JP)
    if (typeof navigator !== 'undefined' && Array.isArray(navigator.languages)) {
      for (const rawLocale of navigator.languages) {
        if (!rawLocale) continue;
        const normalized = rawLocale.toLowerCase().trim();
        const baseCode = normalized.split('-')[0];

        if (this.isSupported(normalized)) {
          return normalized;
        }
        if (this.isSupported(baseCode)) {
          return baseCode;
        }
      }
    }

    if (typeof navigator !== 'undefined' && navigator.language) {
      const baseCode = navigator.language.toLowerCase().split('-')[0];
      if (this.isSupported(baseCode)) {
        return baseCode;
      }
    }

    return DEFAULT_LANGUAGE;
  }

  public setLanguage(code: string, persist = true): void {
    if (!this.isSupported(code)) {
      return;
    }

    this.currentLanguageCode.set(code);
    this.transloco.setActiveLang(code);

    if (persist) {
      this.storage.setItem(STORAGE_KEY_LANGUAGE, code);
    }
  }

  public isSupported(code: string): boolean {
    return this.availableLanguages().some((l) => l.code === code);
  }

  public translate(key: string, params?: Record<string, unknown>): string {
    return this.transloco.translate(key, params);
  }

  public formatNumber(value: number): string {
    try {
      const locale = this.currentLanguage().localeId;
      return new Intl.NumberFormat(locale).format(value);
    } catch {
      return value.toLocaleString();
    }
  }

  public formatDate(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
    try {
      const date = value instanceof Date ? value : new Date(value);
      const locale = this.currentLanguage().localeId;
      return new Intl.DateTimeFormat(locale, options ?? { dateStyle: 'medium' }).format(date);
    } catch {
      return String(value);
    }
  }
}
