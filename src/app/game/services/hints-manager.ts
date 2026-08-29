import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from '../../shared/services/storage/storage.service';
import {
  STORAGE_HINT_GAME_MENU,
  STORAGE_HINT_HOW_TO_PLAY,
  STORAGE_HINT_MOVES_DECREASE,
  STORAGE_HINT_MOVES_INCREASE,
  STORAGE_HINT_POWER_MOVE,
  STORAGE_HINT_ROTATE_HORIZONTAL,
  STORAGE_HINT_ROTATE_VERTICAL,
  TUTORIAL_IDLE_DELAY_MS,
} from '../game-constants';

export enum TutorialType {
  RotateHorizontal = 'RotateHorizontal',
  RotateVertical = 'RotateVertical',
  MovesDecrease = 'MovesDecrease',
  MovesIncrease = 'MovesIncrease',
  PowerMove = 'PowerMove',
  GameMenu = 'GameMenu',
}

export interface TutorialConfig {
  type: TutorialType;
  storageKey: string;
  title: string;
  description: string;
  targetSelector?: string;
  spotlightShape?: 'circle' | 'rect' | 'pill' | 'board';
  arrows?: 'horizontal' | 'vertical' | 'none';
}

export interface HintResult {
  value: string | null;
}

export const ALL_TUTORIAL_HINT_KEYS: string[] = [
  STORAGE_HINT_ROTATE_HORIZONTAL,
  STORAGE_HINT_ROTATE_VERTICAL,
  STORAGE_HINT_MOVES_DECREASE,
  STORAGE_HINT_MOVES_INCREASE,
  STORAGE_HINT_POWER_MOVE,
  STORAGE_HINT_GAME_MENU,
  STORAGE_HINT_HOW_TO_PLAY,
];

@Injectable({
  providedIn: 'root',
})
export class HintsManagerService {
  private storageService = inject(StorageService);

  readonly activeTutorial = signal<TutorialConfig | null>(null);
  readonly isTutorialActive = computed(() => this.activeTutorial() !== null);

  private idleTimeoutId: ReturnType<typeof setTimeout> | null = null;

  public IsHintViewed(target: string): boolean {
    const val = this.storageService.getItem<string>(target);
    return val === 'true';
  }

  public SetHintViewed(target: string): void {
    this.storageService.setItem(target, 'true');
  }

  public ClearHintViewed(target: string): void {
    this.storageService.removeItem(target);
  }

  public GetHintViewed(target: string): Promise<HintResult> {
    const value = this.storageService.getItem<string>(target);
    return Promise.resolve({ value });
  }

  public GetTutorialConfig(type: TutorialType): TutorialConfig {
    switch (type) {
      case TutorialType.RotateHorizontal:
        return {
          type,
          storageKey: STORAGE_HINT_ROTATE_HORIZONTAL,
          title: 'Rotate & Tap to Match',
          description:
            'Swipe rows left or right to line up 3+ matching pieces, then tap any matched piece to clear them!',
          targetSelector: '.game-canvas',
          spotlightShape: 'board',
          arrows: 'horizontal',
        };
      case TutorialType.RotateVertical:
        return {
          type,
          storageKey: STORAGE_HINT_ROTATE_VERTICAL,
          title: 'Rotate Up & Down',
          description:
            'In horizontal levels, swipe columns up or down to align matching pieces. Swipe the background to pan.',
          targetSelector: '.game-canvas',
          spotlightShape: 'board',
          arrows: 'vertical',
        };
      case TutorialType.MovesDecrease:
        return {
          type,
          storageKey: STORAGE_HINT_MOVES_DECREASE,
          title: 'Moves Remaining',
          description: 'Each rotation uses 1 move. Match pieces before your moves run out!',
          targetSelector: '.moves-remaining',
          spotlightShape: 'pill',
          arrows: 'none',
        };
      case TutorialType.MovesIncrease:
        return {
          type,
          storageKey: STORAGE_HINT_MOVES_INCREASE,
          title: 'Earn Extra Moves',
          description: 'Make fast matches (Speed Bonus) or match 4+ pieces (Long Match) to earn bonus moves!',
          targetSelector: '.moves-remaining',
          spotlightShape: 'pill',
          arrows: 'none',
        };
      case TutorialType.PowerMove:
        return {
          type,
          storageKey: STORAGE_HINT_POWER_MOVE,
          title: 'Power Move!',
          description:
            'Power moves appear from 4+ matches. Tap them to clear entire rows or detonate surrounding pieces!',
          targetSelector: '.game-canvas',
          spotlightShape: 'board',
          arrows: 'none',
        };
      case TutorialType.GameMenu:
        return {
          type,
          storageKey: STORAGE_HINT_GAME_MENU,
          title: 'Game Menu',
          description: 'Access audio controls, reset high scores, and other settings here.',
          targetSelector: 'wgl-game-menu',
          spotlightShape: 'circle',
          arrows: 'none',
        };
    }
  }

  public ShowTutorial(type: TutorialType, customConfig?: Partial<TutorialConfig>): boolean {
    const config = { ...this.GetTutorialConfig(type), ...customConfig };
    if (this.IsHintViewed(config.storageKey)) {
      return false;
    }

    // Also check legacy HowToPlay key for RotateHorizontal
    if (type === TutorialType.RotateHorizontal && this.IsHintViewed(STORAGE_HINT_HOW_TO_PLAY)) {
      return false;
    }

    this.activeTutorial.set(config);
    return true;
  }

  public DismissCurrentTutorial(): void {
    const current = this.activeTutorial();
    if (current) {
      this.SetHintViewed(current.storageKey);
      if (current.type === TutorialType.RotateHorizontal) {
        this.SetHintViewed(STORAGE_HINT_HOW_TO_PLAY);
      }
      this.activeTutorial.set(null);
    }
  }

  public SkipAllTutorials(): void {
    this.CancelIdleTimer();
    for (const key of ALL_TUTORIAL_HINT_KEYS) {
      this.SetHintViewed(key);
    }
    this.activeTutorial.set(null);
  }

  public ResetAllTutorials(): void {
    this.CancelIdleTimer();
    for (const key of ALL_TUTORIAL_HINT_KEYS) {
      this.ClearHintViewed(key);
    }
    this.activeTutorial.set(null);
  }

  public StartIdleTimer(type: TutorialType, delayMs = TUTORIAL_IDLE_DELAY_MS): void {
    this.CancelIdleTimer();
    const config = this.GetTutorialConfig(type);
    if (this.IsHintViewed(config.storageKey)) {
      return;
    }
    if (type === TutorialType.RotateHorizontal && this.IsHintViewed(STORAGE_HINT_HOW_TO_PLAY)) {
      return;
    }

    this.idleTimeoutId = setTimeout(() => {
      this.ShowTutorial(type);
      this.idleTimeoutId = null;
    }, delayMs);
  }

  public CancelIdleTimer(): void {
    if (this.idleTimeoutId !== null) {
      clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = null;
    }
  }
}
