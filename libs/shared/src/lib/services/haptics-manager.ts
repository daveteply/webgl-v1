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
   * Trigger calibrated escalating micro-pulses based on match speed bonus points.
   */
  public SpeedBonusPulse(points: number): boolean {
    if (points >= 1500) {
      // Lightning / Blazing: 4-pulse high-velocity micro-stutter
      return this.Vibrate([15, 20, 15, 20, 15, 20, 22]);
    } else if (points >= 800) {
      // Fast / Snap: 3-pulse crisp burst
      return this.Vibrate([14, 25, 14, 25, 18]);
    } else {
      // Quick: snappy double-tap
      return this.Vibrate([12, 35, 15]);
    }
  }

  /**
   * Trigger calibrated escalating impact pulses based on matched piece count (complexity).
   */
  public MatchComplexityPulse(pieceCount: number): boolean {
    if (pieceCount >= 7) {
      // Mega Combo (7+ pieces): cascading crescendo
      return this.Vibrate([25, 30, 35, 30, 45]);
    } else if (pieceCount === 6) {
      // Awesome (6 pieces): heavy rising impact
      return this.Vibrate([22, 30, 32]);
    } else if (pieceCount === 5) {
      // Great (5 pieces): solid two-stage thud
      return this.Vibrate([20, 35, 25]);
    } else if (pieceCount === 4) {
      // Nice (4 pieces): double punch
      return this.Vibrate([18, 40, 15]);
    }
    return this.LightTap();
  }

  /**
   * Trigger high-energy celebratory pulse for combo bonus (both speed and long match).
   */
  public ComboBonusPulse(pieceCount = 4): boolean {
    if (pieceCount >= 6) {
      // Mega combo burst with extended crescendo
      return this.Vibrate([20, 25, 20, 25, 35, 30, 45, 30, 50]);
    }
    return this.Vibrate([20, 25, 20, 25, 35, 30, 45]);
  }

  /**
   * Trigger special 9-step fanfare flourish for perfect match level completion.
   */
  public PerfectMatchPulse(): boolean {
    return this.Vibrate([15, 30, 20, 30, 25, 30, 35, 30, 50]);
  }

  /**
   * Trigger a celebratory haptic pulse sequence for level completion.
   */
  public LevelCompletePulse(): boolean {
    return this.Vibrate([25, 40, 35, 40, 50]);
  }
}
