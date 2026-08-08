import { TestBed } from '@angular/core/testing';
import { PerspectiveCamera, PointLight } from 'three';
import { vi } from 'vitest';

import { EffectsManagerService as EffectsManager } from './effects-manager';
import { GameWheel } from '../models/game-wheel';
import { LevelAnimationStyle } from '../models/level-animation-style';

describe('EffectsManager', () => {
  let service: EffectsManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EffectsManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should trigger AnimateLevelChangeAnimation with custom LevelAnimationStyle', () => {
    const wheels = [new GameWheel(0, [])];
    const verticalTargets = [0];
    const camera = new PerspectiveCamera();
    const light = new PointLight();

    const spy = vi.spyOn(wheels[0], 'AnimateLevelStartTween');

    service.AnimateLevelChangeAnimation(wheels, verticalTargets, camera, light, true, LevelAnimationStyle.SpiralVortex);

    expect(spy).toHaveBeenCalledWith(0, expect.any(Number), true, expect.any(Number), LevelAnimationStyle.SpiralVortex);
  });
});
