import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { StorageService } from '../storage/storage.service';
import { LanguageService } from './language.service';
import { DEFAULT_LANGUAGE, STORAGE_KEY_LANGUAGE } from './language.model';
import { provideTranslocoTesting } from './language.testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LanguageService', () => {
  let service: LanguageService;
  let translocoService: TranslocoService;
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LanguageService, StorageService, provideTranslocoTesting()],
    });

    service = TestBed.inject(LanguageService);
    translocoService = TestBed.inject(TranslocoService);
    storageService = TestBed.inject(StorageService);
    storageService.clear();
  });

  it('should initialize with default language when no storage or match exists', () => {
    expect(service.currentLanguageCode()).toBe(DEFAULT_LANGUAGE);
  });

  it('should switch language and update Transloco and storage when setLanguage is called', () => {
    const setActiveSpy = vi.spyOn(translocoService, 'setActiveLang');
    const setStorageSpy = vi.spyOn(storageService, 'setItem');

    service.setLanguage('es');

    expect(service.currentLanguageCode()).toBe('es');
    expect(service.currentLanguage().label).toBe('Español');
    expect(setActiveSpy).toHaveBeenCalledWith('es');
    expect(setStorageSpy).toHaveBeenCalledWith(STORAGE_KEY_LANGUAGE, 'es');
  });

  it('should format numbers according to active language locale', () => {
    service.setLanguage('en');
    const formattedEn = service.formatNumber(12500);
    expect(formattedEn).toContain('12');

    service.setLanguage('de');
    const formattedDe = service.formatNumber(12500);
    expect(formattedDe).toBeDefined();
  });

  it('should resolve language from saved preference', () => {
    storageService.setItem(STORAGE_KEY_LANGUAGE, 'fr');
    expect(service.resolveInitialLanguage()).toBe('fr');
  });
});
