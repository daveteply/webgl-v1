import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { StorageService } from '../../shared/services/storage/storage.service';
import { ALL_TUTORIAL_HINT_KEYS, HintsManagerService, TutorialType } from './hints-manager';
import {
  STORAGE_HINT_HOW_TO_PLAY,
  STORAGE_HINT_MOVES_DECREASE,
  STORAGE_HINT_ROTATE_HORIZONTAL,
} from '../game-constants';

describe('HintsManagerService', () => {
  let service: HintsManagerService;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HintsManagerService, StorageService],
    });
    service = TestBed.inject(HintsManagerService);
    storage = TestBed.inject(StorageService);
    storage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show tutorial when hint has not been viewed', () => {
    const shown = service.ShowTutorial(TutorialType.RotateHorizontal);
    expect(shown).toBe(true);
    expect(service.isTutorialActive()).toBe(true);
    expect(service.activeTutorial()?.type).toBe(TutorialType.RotateHorizontal);
  });

  it('should not show tutorial if already viewed in storage', () => {
    service.SetHintViewed(STORAGE_HINT_ROTATE_HORIZONTAL);
    const shown = service.ShowTutorial(TutorialType.RotateHorizontal);
    expect(shown).toBe(false);
    expect(service.isTutorialActive()).toBe(false);
  });

  it('should not show RotateHorizontal if legacy HowToPlay hint was viewed', () => {
    service.SetHintViewed(STORAGE_HINT_HOW_TO_PLAY);
    const shown = service.ShowTutorial(TutorialType.RotateHorizontal);
    expect(shown).toBe(false);
    expect(service.isTutorialActive()).toBe(false);
  });

  it('should dismiss active tutorial and persist storage key', () => {
    service.ShowTutorial(TutorialType.MovesDecrease);
    expect(service.isTutorialActive()).toBe(true);

    service.DismissCurrentTutorial();
    expect(service.isTutorialActive()).toBe(false);
    expect(service.IsHintViewed(STORAGE_HINT_MOVES_DECREASE)).toBe(true);
  });

  it('should skip all tutorials and mark all keys as viewed', () => {
    service.ShowTutorial(TutorialType.RotateHorizontal);
    service.SkipAllTutorials();

    expect(service.isTutorialActive()).toBe(false);
    for (const key of ALL_TUTORIAL_HINT_KEYS) {
      expect(service.IsHintViewed(key)).toBe(true);
    }
  });

  it('should reset all tutorials and remove all keys from storage', () => {
    service.SkipAllTutorials();
    service.ResetAllTutorials();

    for (const key of ALL_TUTORIAL_HINT_KEYS) {
      expect(service.IsHintViewed(key)).toBe(false);
    }
  });

  it('should trigger idle timer after delay', () => {
    vi.useFakeTimers();
    service.StartIdleTimer(TutorialType.RotateHorizontal, 2000);

    expect(service.isTutorialActive()).toBe(false);
    vi.advanceTimersByTime(2000);
    expect(service.isTutorialActive()).toBe(true);
    expect(service.activeTutorial()?.type).toBe(TutorialType.RotateHorizontal);

    vi.useRealTimers();
  });

  it('should cancel idle timer if cancelIdleTimer is called before delay', () => {
    vi.useFakeTimers();
    service.StartIdleTimer(TutorialType.RotateHorizontal, 2000);
    service.CancelIdleTimer();

    vi.advanceTimersByTime(2000);
    expect(service.isTutorialActive()).toBe(false);

    vi.useRealTimers();
  });
});
