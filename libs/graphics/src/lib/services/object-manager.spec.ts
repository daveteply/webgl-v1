import { TestBed } from '@angular/core/testing';

import { ObjectManagerService } from './object-manager';

describe('ObjectManagerService', () => {
  let service: ObjectManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectManagerService);
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
