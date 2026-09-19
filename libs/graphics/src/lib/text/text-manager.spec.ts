import { TestBed } from '@angular/core/testing';
import { PerspectiveCamera, Scene, Vector3 } from 'three';
import { TranslocoService } from '@jsverse/transloco';
import { vi } from 'vitest';

import { TextManagerService } from './text-manager';
import { SplashMotionStyle } from './splash-text';
import { LanguageService, provideTranslocoTesting } from '@rikkle/shared';

const enTranslations = {
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
    KABOOM: 'Kaboom',
  },
};

describe('TextManagerService', () => {
  let service: TextManagerService;
  let translocoService: TranslocoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LanguageService, TextManagerService, provideTranslocoTesting()],
    });
    service = TestBed.inject(TextManagerService);
    translocoService = TestBed.inject(TranslocoService);
    translocoService.setTranslation(enTranslations, 'en');
    translocoService.setActiveLang('en');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should attach text group to camera when SetCamera is called', () => {
    const scene = new Scene();
    const camera = new PerspectiveCamera();
    service.InitScene(scene);
    service.SetCamera(camera);

    expect(camera.children.length).toBe(1);
    expect(camera.children[0].name).toBe('textGroup');
  });

  it('should handle ShowText, ShowPerfectMatch, ShowSpeedBonus, ShowLongMatchBonus, and ShowPowerMove safely before font loads', () => {
    expect(() => {
      service.ShowText(['Test Message']);
      service.ShowPerfectMatch(100);
      service.ShowSpeedBonus(2000);
      service.ShowLongMatchBonus(20);
      service.ShowPowerMove('POWER_MOVES.SPIN_RIGHT', 50);
      service.ShowPowerMove('POWER_MOVES.KABOOM', 100, 1);
      service.ShowFloatingText('Floating Test', new Vector3(0, 0, 0));
    }).not.toThrow();
  });

  it('should format and queue power moves correctly for single and multi-power invocations', () => {
    const showTextSpy = vi.spyOn(service, 'ShowText');

    service.ShowPowerMove('POWER_MOVES.SPIN_RIGHT', 50);
    expect(showTextSpy).toHaveBeenCalledWith(['Spin right!', '+50 Points'], {
      color: undefined,
      colorCycleFirstLine: true,
      motionStyle: SplashMotionStyle.Fanfare,
      holdDurationMs: 900,
      withParticles: true,
    });

    service.ShowPowerMove('POWER_MOVES.KABOOM', 100, 1, 0xff0000);
    expect(showTextSpy).toHaveBeenCalledWith(['Multi-Power!', '+1 Move', '+100 Points'], {
      color: 0xff0000,
      colorCycleFirstLine: true,
      holdDurationMs: 1200,
      motionStyle: SplashMotionStyle.Fanfare,
      withParticles: true,
      particleColors: [0xff00ea, 0x00ffcc, 0xffd700, 0xffffff],
    });
  });

  it('should format and queue perfect match with extended hold duration and fanfare styling', () => {
    const showTextSpy = vi.spyOn(service, 'ShowText');

    service.ShowPerfectMatch(200, 0x00ff00);
    expect(showTextSpy).toHaveBeenCalledWith(['Perfect Match!', '+200 Points'], {
      color: 0x00ff00,
      colorCycleFirstLine: true,
      holdDurationMs: 1400,
      motionStyle: SplashMotionStyle.Fanfare,
      withParticles: true,
      particleColors: [0x00ffcc, 0xffd700, 0xffffff, 0xff00ff],
    });
  });

  it('should format and queue speed bonus and long match bonus in HUD mode', () => {
    const showTextSpy = vi.spyOn(service, 'ShowText');

    service.ShowSpeedBonus(1500, 0xffa500);
    expect(showTextSpy).toHaveBeenCalledWith(['Speed Bonus', '+1500 Points'], {
      color: 0xffa500,
      motionStyle: SplashMotionStyle.PunchPop,
      holdDurationMs: 850,
    });

    service.ShowLongMatchBonus(30, 0xffff00);
    expect(showTextSpy).toHaveBeenCalledWith(['Long Match', '+30 Points'], {
      color: 0xffff00,
      motionStyle: SplashMotionStyle.ImpactStamp,
      holdDurationMs: 950,
    });

    service.ShowComboBonus(1800, 5, 0xffd700);
    expect(showTextSpy).toHaveBeenCalledWith(['Super Speed!', '+1800 Points'], {
      color: 0xffd700,
      colorCycleFirstLine: true,
      motionStyle: SplashMotionStyle.ImpactStamp,
      holdDurationMs: 1100,
      withParticles: true,
    });
  });
});
