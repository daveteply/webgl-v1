import { TestBed } from '@angular/core/testing';
import { PerspectiveCamera, Scene, Vector3 } from 'three';

import { TextManagerService } from './text-manager';
import { SplashMotionStyle } from './splash-text';

describe('TextManagerService', () => {
  let service: TextManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextManagerService);
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
      service.ShowPowerMove('Spin right', 50);
      service.ShowPowerMove('Multi-Power', 100, 1);
      service.ShowFloatingText('Floating Test', new Vector3(0, 0, 0));
    }).not.toThrow();
  });

  it('should format and queue power moves correctly for single and multi-power invocations', () => {
    const showTextSpy = vi.spyOn(service, 'ShowText');

    service.ShowPowerMove('Spin right', 50);
    expect(showTextSpy).toHaveBeenCalledWith(['Spin right!', '+50 Points'], {
      color: undefined,
      colorCycleFirstLine: true,
      motionStyle: SplashMotionStyle.Fanfare,
      holdDurationMs: 900,
      withParticles: true,
    });

    service.ShowPowerMove('Kaboom', 100, 1, 0xff0000);
    expect(showTextSpy).toHaveBeenCalledWith(['Multi-Power!', '+1 Move', '+100 Points'], {
      color: 0xff0000,
      colorCycleFirstLine: true,
      holdDurationMs: 1200,
      motionStyle: SplashMotionStyle.Fanfare,
      withParticles: true,
      particleColors: [0xff00ea, 0x00ffcc, 0xffd700, 0xffffff],
    });

    service.ShowPowerMove('Kaboom', 150, 2);
    expect(showTextSpy).toHaveBeenCalledWith(['Multi-Power!', '+2 Moves', '+150 Points'], {
      color: undefined,
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
