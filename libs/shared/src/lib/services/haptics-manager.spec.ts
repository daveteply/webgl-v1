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
    vi.stubGlobal('navigator', { vibrate: vibrateSpy, maxTouchPoints: 1 });
    service.HapticsEnabled = false;

    const result = service.LightTap();
    expect(vibrateSpy).not.toHaveBeenCalled();
    expect(result).toBe(false);

    vi.unstubAllGlobals();
  });

  it('should trigger LightTap when vibrate is available and enabled', () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', { vibrate: vibrateSpy, maxTouchPoints: 1 });
    service.HapticsEnabled = true;

    const result = service.LightTap();
    expect(vibrateSpy).toHaveBeenCalledWith(12);
    expect(result).toBe(true);

    vi.unstubAllGlobals();
  });

  it('should return false for desktop environment without touch points', () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', {
      vibrate: vibrateSpy,
      maxTouchPoints: 0,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    });
    expect(service.isAvailable).toBe(false);

    vi.unstubAllGlobals();
  });

  it('should return true for mobile environment with vibrate support', () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', {
      vibrate: vibrateSpy,
      maxTouchPoints: 5,
      userAgent: 'Mozilla/5.0 (Linux; Android 10)',
    });
    expect(service.isAvailable).toBe(true);

    vi.unstubAllGlobals();
  });

  it('should trigger calibrated patterns for SpeedBonusPulse tiers', () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', { vibrate: vibrateSpy, maxTouchPoints: 1 });
    service.HapticsEnabled = true;

    service.SpeedBonusPulse(600);
    expect(vibrateSpy).toHaveBeenCalledWith([12, 35, 15]);

    service.SpeedBonusPulse(1000);
    expect(vibrateSpy).toHaveBeenCalledWith([14, 25, 14, 25, 18]);

    service.SpeedBonusPulse(2000);
    expect(vibrateSpy).toHaveBeenCalledWith([15, 20, 15, 20, 15, 20, 22]);

    vi.unstubAllGlobals();
  });

  it('should trigger calibrated patterns for MatchComplexityPulse tiers', () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', { vibrate: vibrateSpy, maxTouchPoints: 1 });
    service.HapticsEnabled = true;

    service.MatchComplexityPulse(3);
    expect(vibrateSpy).toHaveBeenCalledWith(12);

    service.MatchComplexityPulse(4);
    expect(vibrateSpy).toHaveBeenCalledWith([18, 40, 15]);

    service.MatchComplexityPulse(5);
    expect(vibrateSpy).toHaveBeenCalledWith([20, 35, 25]);

    service.MatchComplexityPulse(6);
    expect(vibrateSpy).toHaveBeenCalledWith([22, 30, 32]);

    service.MatchComplexityPulse(8);
    expect(vibrateSpy).toHaveBeenCalledWith([25, 30, 35, 30, 45]);

    vi.unstubAllGlobals();
  });

  it('should trigger ComboBonusPulse and PerfectMatchPulse patterns', () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', { vibrate: vibrateSpy, maxTouchPoints: 1 });
    service.HapticsEnabled = true;

    service.ComboBonusPulse(5);
    expect(vibrateSpy).toHaveBeenCalledWith([20, 25, 20, 25, 35, 30, 45]);

    service.ComboBonusPulse(7);
    expect(vibrateSpy).toHaveBeenCalledWith([20, 25, 20, 25, 35, 30, 45, 30, 50]);

    service.PerfectMatchPulse();
    expect(vibrateSpy).toHaveBeenCalledWith([15, 30, 20, 30, 25, 30, 35, 30, 50]);

    vi.unstubAllGlobals();
  });
});
