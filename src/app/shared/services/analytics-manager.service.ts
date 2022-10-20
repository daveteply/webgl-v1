import { Injectable } from '@angular/core';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { DeviceManagerService } from './device-manager.service';

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
  constructor(private deviceManagerService: DeviceManagerService) {}

  public Log(logType: AnalyticsEventType): void {
    switch (logType) {
      case AnalyticsEventType.ShareCTA:
        this.logEvent('share_cta', AnalyticsEventType.ShareCTA + '');
        break;
    }
  }

  private logEvent(name: string, id: string): void {
    if (!this.deviceManagerService.IsWeb) {
      FirebaseAnalytics.logEvent({
        name: name,
        params: { content_id: id },
      });
    }
  }
}
