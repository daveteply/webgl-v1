import { TestBed } from '@angular/core/testing';
import { PerspectiveCamera, PointLight } from 'three';
import { vi } from 'vitest';

import { EffectsManagerService } from './effects-manager';
import { GameWheel } from '../models/game-wheel';
import { LevelAnimationStyle } from '../models/level-animation-style';
import { LevelOrientationType } from '../models/level-orientation-type';
import { GravityType } from '../models/gravity-type';
import { PowerMoveType } from '../models/power-move-type';

describe('EffectsManagerService', () => {
  let service: EffectsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EffectsManagerService);
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

  it('should emit GravityAnimationComplete immediately when gravityType is None', () => {
    let completed = false;
    service.GravityAnimationComplete.subscribe(() => {
      completed = true;
    });
    service.AnimateGravity([], GravityType.None);
    expect(completed).toBe(true);
  });

  it('should emit LevelChangeAnimation state during level transitions', () => {
    let animationState: boolean | undefined;
    service.LevelChangeAnimation.subscribe((state) => {
      animationState = state;
    });

    const wheels = [new GameWheel(0, [])];
    const camera = new PerspectiveCamera();
    const light = new PointLight();

    service.AnimateLevelChangeAnimation(wheels, [0], camera, light, true);
    expect(animationState).toBe(true);
  });

  it('should handle AnimateGravity with game wheels and complete', () => {
    let completed = false;
    service.GravityAnimationComplete.subscribe(() => {
      completed = true;
    });

    const wheels = [new GameWheel(0, []), new GameWheel(1, [])];
    service.AnimateGravity(wheels, GravityType.Down);
    expect(completed).toBe(true);
  });

  it('should trigger AnimateVerticalPowerMove on wheels for vertical moves', () => {
    const wheels = [new GameWheel(0, []), new GameWheel(1, [])];
    const spy1 = vi.spyOn(wheels[0], 'AnimateVerticalPowerMove');
    const spy2 = vi.spyOn(wheels[1], 'AnimateVerticalPowerMove');

    service.AnimatePowerMove(wheels, PowerMoveType.VerticalUp);

    expect(spy1).toHaveBeenCalledWith(PowerMoveType.VerticalUp);
    expect(spy2).toHaveBeenCalledWith(PowerMoveType.VerticalUp);
  });

  it('should trigger AnimateHorizontalPowerMove on wheels for horizontal moves', () => {
    const wheels = [new GameWheel(0, []), new GameWheel(1, [])];
    const spy1 = vi.spyOn(wheels[0], 'AnimateHorizontalPowerMove');
    const spy2 = vi.spyOn(wheels[1], 'AnimateHorizontalPowerMove');

    service.AnimatePowerMove(wheels, PowerMoveType.HorizontalRight);

    expect(spy1).toHaveBeenCalledWith(PowerMoveType.HorizontalRight);
    expect(spy2).toHaveBeenCalledWith(PowerMoveType.HorizontalRight);
  });

  it('should emit RemoveAnimationComplete immediately when no pieces are provided', () => {
    let completed = false;
    service.RemoveAnimationComplete.subscribe(() => {
      completed = true;
    });

    service.AnimateRemove([]);
    expect(completed).toBe(true);
  });

  it('should lock board and initialize camera turn when LevelOrientation is HorizontalRight', () => {
    let locked = false;
    service.LevelChangeAnimation.subscribe((isLocked) => {
      locked = isLocked;
    });

    const wheels = [new GameWheel(0, [])];
    const camera = new PerspectiveCamera();
    const light = new PointLight();

    service.AnimateLevelChangeAnimation(
      wheels,
      [0],
      camera,
      light,
      true,
      undefined,
      LevelOrientationType.HorizontalRight,
    );

    expect(locked).toBe(true);
  });
});
