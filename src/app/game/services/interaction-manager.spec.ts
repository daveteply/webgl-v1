import { TestBed } from '@angular/core/testing';
import { PerspectiveCamera } from 'three';
import { vi } from 'vitest';

import { InteractionManager } from './interaction-manager';
import { EffectsManager } from './effects-manager';
import { ScoringManagerService } from './scoring-manager';
import { ObjectManagerService } from './object-manager';
import { GameEngineService } from './game-engine';
import { PowerMoveType } from '../models/power-move-type';
import { AudioType } from '../../shared/services/audio/audio-data';
import { AudioManagerService } from '../../shared/services/audio/audio-manager';
import { GamePiece } from '../models/game-piece/game-piece';

describe('InteractionManager', () => {
  let service: InteractionManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteractionManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should stop drag when pointer leaves container bounds', () => {
    const el = document.createElement('div');
    service.InitInteractions(el);
    service.SetCamera(new PerspectiveCamera());
    service.CanvasRect = {
      left: 100,
      right: 500,
      top: 100,
      bottom: 500,
      width: 400,
      height: 400,
      x: 100,
      y: 100,
      toJSON: () => undefined,
    } as DOMRect;

    // Simulate pointerdown inside bounds
    const downEvent = new PointerEvent('pointerdown', { clientX: 200, clientY: 200 });
    el.dispatchEvent(downEvent);

    // Simulate pointermove dragging past right edge
    const moveOutsideEvent = new PointerEvent('pointermove', { clientX: 550, clientY: 200 });
    window.dispatchEvent(moveOutsideEvent);

    // Verify pointer state was reset/stopped
    expect(service['_isPointerDown']).toBe(false);
    expect(service['_isDragging']).toBe(false);
  });

  it('should play POWER_MOVE_BOMB audio when Bomb power move is triggered', () => {
    const audioManager = TestBed.inject(AudioManagerService);
    const playSpy = vi.spyOn(audioManager, 'PlayAudio');

    const mockPiece = {
      id: 1,
      PowerMoveType: PowerMoveType.Bomb,
      PowerMoveRemove: vi.fn(),
    } as unknown as GamePiece;

    service['powerMove'](mockPiece);
    expect(playSpy).toHaveBeenCalledWith(AudioType.POWER_MOVE_BOMB);
  });

  it('should play POWER_MOVE_USE and keep board locked during vertical power moves until animation completes', () => {
    const audioManager = TestBed.inject(AudioManagerService);
    const effectsManager = TestBed.inject(EffectsManager);
    const playSpy = vi.spyOn(audioManager, 'PlayAudio');

    const mockPiece = {
      id: 2,
      PowerMoveType: PowerMoveType.VerticalUp,
      PowerMoveRemove: vi.fn(),
    } as unknown as GamePiece;

    service['powerMove'](mockPiece);

    expect(playSpy).toHaveBeenCalledWith(AudioType.POWER_MOVE_USE);
    expect(service['_locked']).toBe(true);

    effectsManager.PowerMoveAnimationComplete.next();
    expect(service['_locked']).toBe(false);
  });

  it('should wait for RemoveAnimationComplete before triggering level complete animation on Bomb', () => {
    const audioManager = TestBed.inject(AudioManagerService);
    const effectsManager = TestBed.inject(EffectsManager);
    const scoringManager = TestBed.inject(ScoringManagerService);
    const objectManager = TestBed.inject(ObjectManagerService);
    const gameEngine = TestBed.inject(GameEngineService);
    const playSpy = vi.spyOn(audioManager, 'PlayLevelComplete');
    const animateLevelSpy = vi.spyOn(objectManager, 'AnimateLevelComplete');

    vi.spyOn(scoringManager, 'LevelComplete', 'get').mockReturnValue(true);

    const mockPiece = {
      id: 3,
      PowerMoveType: PowerMoveType.Bomb,
      PowerMoveRemove: vi.fn(),
    } as unknown as GamePiece;

    const mockTargetPiece = {
      id: 4,
      PowerMoveType: PowerMoveType.None,
      AnimateRemovalTween: vi.fn().mockReturnValue({
        onComplete: vi.fn().mockReturnThis(),
        onStop: vi.fn().mockReturnThis(),
      }),
    } as unknown as GamePiece;

    vi.spyOn(gameEngine, 'FindBombTargets').mockReturnValue([mockPiece, mockTargetPiece]);

    service['powerMove'](mockPiece);

    expect(playSpy).not.toHaveBeenCalled();
    expect(animateLevelSpy).not.toHaveBeenCalled();

    effectsManager.RemoveAnimationComplete.next();

    expect(playSpy).toHaveBeenCalled();
    expect(animateLevelSpy).toHaveBeenCalled();
  });
});
