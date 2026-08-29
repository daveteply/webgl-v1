import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage/storage.service';

const HAPTICS_STORAGE_KEY = 'rikkle_haptics_enabled';

@Injectable({
  providedIn: 'root',
})
export class HapticsManagerService {
  private storageService = inject(StorageService);
  private _hapticsEnabled: boolean;

  constructor() {
    const saved = this.storageService.getItem<boolean>(HAPTICS_STORAGE_KEY);
    this._hapticsEnabled = saved ?? true;
  }

  /**
   * Check if Web Vibration API is supported by the user agent and hardware.
   */
  public get isAvailable(): boolean {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator) || typeof navigator.vibrate !== 'function') {
      return false;
    }
    // Desktop Chrome exposes navigator.vibrate even on non-vibrating desktop PCs.
    // Ensure the device supports touch points or a mobile/tablet environment.
    const isTouchOrMobile =
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

    return !!isTouchOrMobile;
  }

  /**
   * Whether user has enabled haptic feedback in settings.
   */
  public get hapticsEnabled(): boolean {
    return this._hapticsEnabled;
  }

  public set HapticsEnabled(enabled: boolean) {
    this._hapticsEnabled = enabled;
    this.storageService.setItem(HAPTICS_STORAGE_KEY, enabled);
  }

  /**
   * Trigger a vibration pattern using the Web Vibration API.
   * @param pattern Milliseconds or pattern array for vibration pulses.
   */
  public Vibrate(pattern: number | number[]): boolean {
    if (this.isAvailable && this._hapticsEnabled) {
      try {
        return navigator.vibrate(pattern);
      } catch {
        // Handle security policy or user gesture restrictions silently
        return false;
      }
    }
    return false;
  }

  /**
   * Trigger a very light, subtle haptic tap (12ms pulse) when a game piece is removed.
   */
  public LightTap(): boolean {
    return this.Vibrate(12);
  }

  /**
   * Trigger a light tick (8ms pulse) for wheel snap-to-grid rotation.
   */
  public SnapTap(): boolean {
    return this.Vibrate(8);
  }

  /**
   * Trigger a distinct double-pulse haptic pattern for power-up move activations.
   */
  public PowerMovePulse(): boolean {
    return this.Vibrate([15, 30, 20]);
  }

  /**
   * Trigger a celebratory haptic pulse sequence for level completion.
   */
  public LevelCompletePulse(): boolean {
    return this.Vibrate([25, 40, 35, 40, 50]);
  }
}
