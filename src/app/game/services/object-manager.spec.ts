import { TestBed } from '@angular/core/testing';

import { ObjectManager } from './object-manager';

describe('ObjectManager', () => {
  let service: ObjectManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit LevelCompleted event', () => {
    let completed = false;
    service.LevelCompleted.subscribe((win) => {
      completed = win;
    });
    service.LevelCompleted.next(true);
    expect(completed).toBe(true);
  });

  it('should emit LevelChangeAnimationComplete event', () => {
    let animComplete = false;
    service.LevelChangeAnimationComplete.subscribe(() => {
      animComplete = true;
    });
    service.LevelChangeAnimationComplete.next();
    expect(animComplete).toBe(true);
  });
});
