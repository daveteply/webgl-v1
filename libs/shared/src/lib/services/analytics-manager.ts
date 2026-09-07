import { Injectable } from '@angular/core';
import type { Dict } from 'mixpanel-browser';

export const MIXPANEL_TOKEN = '28b44f3bae1356f754ef458b4ae316c6';

export enum AnalyticsEventType {
  // Share
  ShareCTA = 1000,

  // Game Menu
  GameMenu = 2000,
  GameMenuAboutCTA = 2001,
  GameMenuSaveCTA = 2002,
  GameMenuSettingsCTA = 2003,
  GameMenuInstallAppCTA = 2004,

  // Level Complete Dialog
  LevelDialogNextCTA = 3000,

  // Intro Dialog
  IntroDialogRestoreCTA = 4000,
  IntroDialogNewGameCTA = 4001,
  IntroDialogConfirmNewGameCTA = 4002,
  IntroDialogCancelNewGameCTA = 4003,

  // Game Over Dialog
  GameOverDialogViewed = 5000,
  GameOverRestartLevelCTA = 5001,
  GameOverStartOverCTA = 5002,
  GameOverConfirmStartOverCTA = 5003,
  GameOverCancelStartOverCTA = 5004,

  // About Dialog
  AboutDialogViewed = 6000,

  // Game Lifecycle
  LevelStarted = 7000,
  LevelCompleted = 7001,
  GameOver = 7002,

  // Settings
  SettingsHapticsChanged = 8000,
  SettingsGameVolumeChanged = 8001,
  SettingsMusicVolumeChanged = 8002,
  SettingsClearHighScores = 8003,
  SettingsFactoryReset = 8004,

  // PWA
  PwaInstallPromptOutcome = 9000,
}

type MixpanelInstance = typeof import('mixpanel-browser').default;

@Injectable({
  providedIn: 'root',
})
export class AnalyticsManagerService {
  private _mixpanel: MixpanelInstance | null = null;
  private _initPromise: Promise<void> | null = null;
  private _queue: ((mp: MixpanelInstance) => void)[] = [];

  constructor() {
    void this.init();
  }

  public init(token = MIXPANEL_TOKEN): Promise<void> {
    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = import('mixpanel-browser')
      .then((module) => {
        const mp = module.default;
        mp.init(token, {
          autocapture: true,
          record_sessions_percent: 100,
        });
        this._mixpanel = mp;
        while (this._queue.length > 0) {
          const action = this._queue.shift();
          action?.(mp);
        }
      })
      .catch((err) => {
        console.warn('Mixpanel dynamic import/initialization failed:', err);
      });

    return this._initPromise;
  }

  public Log(logType: AnalyticsEventType, properties?: Dict): void {
    const eventName = AnalyticsEventType[logType] ?? `Event_${logType}`;
    this.Track(eventName, properties);
  }

  public Track(eventName: string, properties?: Dict): void {
    this.execute((mp) => {
      try {
        mp.track(eventName, properties);
      } catch (err) {
        console.warn(`Mixpanel track failed for event "${eventName}":`, err);
      }
    });
  }

  public Identify(uniqueId: string): void {
    this.execute((mp) => {
      try {
        mp.identify(uniqueId);
      } catch (err) {
        console.warn('Mixpanel identify failed:', err);
      }
    });
  }

  public SetUserProperties(properties: Dict): void {
    this.execute((mp) => {
      try {
        mp.people.set(properties);
      } catch (err) {
        console.warn('Mixpanel people.set failed:', err);
      }
    });
  }

  public Reset(): void {
    this.execute((mp) => {
      try {
        mp.reset();
      } catch (err) {
        console.warn('Mixpanel reset failed:', err);
      }
    });
  }

  private execute(action: (mp: MixpanelInstance) => void): void {
    if (this._mixpanel) {
      action(this._mixpanel);
    } else {
      this._queue.push(action);
    }
  }
}
