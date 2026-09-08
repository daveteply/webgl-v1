import { TestBed } from '@angular/core/testing';
import { PerspectiveCamera, Scene } from 'three';

import { TextManagerService } from './text-manager';

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
    }).not.toThrow();
  });

  it('should format and queue power moves correctly for single and multi-power invocations', () => {
    const showTextSpy = vi.spyOn(service, 'ShowText');

    service.ShowPowerMove('Spin right', 50);
    expect(showTextSpy).toHaveBeenCalledWith(['Spin right!', '+50 Points'], {
      color: undefined,
      colorCycleFirstLine: true,
    });

    service.ShowPowerMove('Kaboom', 100, 1, 0xff0000);
    expect(showTextSpy).toHaveBeenCalledWith(['Multi-Power!', '+1 Move', '+100 Points'], {
      color: 0xff0000,
      colorCycleFirstLine: true,
    });

    service.ShowPowerMove('Kaboom', 150, 2);
    expect(showTextSpy).toHaveBeenCalledWith(['Multi-Power!', '+2 Moves', '+150 Points'], {
      color: undefined,
      colorCycleFirstLine: true,
    });
  });

  it('should format and queue perfect match with extended hold duration', () => {
    const showTextSpy = vi.spyOn(service, 'ShowText');

    service.ShowPerfectMatch(200, 0x00ff00);
    expect(showTextSpy).toHaveBeenCalledWith(['Perfect Match!', '+200 Points'], {
      color: 0x00ff00,
      colorCycleFirstLine: true,
      holdDurationMs: 1200,
    });
  });

  it('should format and queue speed bonus and long match bonus', () => {
    const showTextSpy = vi.spyOn(service, 'ShowText');

    service.ShowSpeedBonus(1500, 0xffa500);
    expect(showTextSpy).toHaveBeenCalledWith(['Speed Bonus', '+1500 Points'], {
      color: 0xffa500,
    });

    service.ShowLongMatchBonus(30, 0xffff00);
    expect(showTextSpy).toHaveBeenCalledWith(['Long Match', '+30 Points'], {
      color: 0xffff00,
    });
  });
});
