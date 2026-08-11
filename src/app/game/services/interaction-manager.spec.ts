import { TestBed } from '@angular/core/testing';

import { InteractionManager } from './interaction-manager';

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
    service.CanvasRect = {
      left: 100,
      right: 500,
      top: 100,
      bottom: 500,
      width: 400,
      height: 400,
      x: 100,
      y: 100,
      toJSON: () => {},
    } as DOMRect;

    // Simulate pointerdown inside bounds
    const downEvent = new PointerEvent('pointerdown', { clientX: 200, clientY: 200 });
    el.dispatchEvent(downEvent);

    // Simulate pointermove dragging past right edge
    const moveOutsideEvent = new PointerEvent('pointermove', { clientX: 550, clientY: 200 });
    window.dispatchEvent(moveOutsideEvent);

    // Verify pointer state was reset/stopped
    expect((service as any)._isPointerDown).toBe(false);
    expect((service as any)._isDragging).toBe(false);
  });
});
