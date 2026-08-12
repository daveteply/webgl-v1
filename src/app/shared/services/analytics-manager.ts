import { Injectable } from '@angular/core';

export enum AnalyticsEventType {
  ShareCTA = 1000,
  GameMenu = 2000,
  GameMenuAboutCTA = 2001,
  GameMenuSaveCTA = 2002,
  LevelDialogNextCTA = 3000,
  IntroDialogRestoreCTA = 4000,
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsManagerService {
  public Log(_logType: AnalyticsEventType): void {
    // Analytics logging disabled / no-op in web version
    void _logType;
  }
}

export { AnalyticsManagerService as AnalyticsManager };
