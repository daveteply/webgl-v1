import { TestBed } from '@angular/core/testing';
import { PerspectiveCamera } from 'three';
import { vi } from 'vitest';

import { InteractionManager } from './interaction-manager';
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
});
