import { TestBed } from '@angular/core/testing';
import { HapticsManagerService } from './haptics-manager';
import { StorageService } from './storage/storage.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('HapticsManagerService', () => {
  let service: HapticsManagerService;
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    storageService = TestBed.inject(StorageService);
    vi.spyOn(storageService, 'getItem').mockReturnValue(true);
    service = TestBed.inject(HapticsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should safely check vibration API availability', () => {
    expect(typeof service.isAvailable).toBe('boolean');
  });

  it('should default to enabled when no storage preference exists', () => {
    expect(service.hapticsEnabled).toBe(true);
  });

  it('should update and store hapticsEnabled setting', () => {
    const setItemSpy = vi.spyOn(storageService, 'setItem');
    service.HapticsEnabled = false;

    expect(service.hapticsEnabled).toBe(false);
    expect(setItemSpy).toHaveBeenCalledWith('rikkle_haptics_enabled', false);
  });

  it('should not vibrate when hapticsEnabled is false', () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', { vibrate: vibrateSpy });
    service.HapticsEnabled = false;

    const result = service.LightTap();
    expect(vibrateSpy).not.toHaveBeenCalled();
    expect(result).toBe(false);

    vi.unstubAllGlobals();
  });

  it('should trigger LightTap when vibrate is available and enabled', () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', { vibrate: vibrateSpy });
    service.HapticsEnabled = true;

    const result = service.LightTap();
    expect(vibrateSpy).toHaveBeenCalledWith(12);
    expect(result).toBe(true);

    vi.unstubAllGlobals();
  });
});
