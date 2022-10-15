import { Injectable } from '@angular/core';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import {
  ANALYTICS_GAME_MENU_ABOUT_CTA_ID,
  ANALYTICS_GAME_MENU_CTA_ID,
  ANALYTICS_GAME_MENU_SAVE_CTA_ID,
  ANALYTICS_RESTORE_CTA_ID,
  ANALYTICS_SHARE_CTA_ID,
} from 'src/app/game/game-constants';
import { DeviceManagerService } from './device-manager.service';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsManagerService {
  constructor(private deviceManagerService: DeviceManagerService) {}

  public LogShareCTA(): void {
    this.logEvent('share_cta', ANALYTICS_SHARE_CTA_ID);
  }

  public LogGameMenuCTA(): void {
    this.logEvent('game_menu_cta', ANALYTICS_GAME_MENU_CTA_ID);
  }
  public LogGameMenuAboutCTA(): void {
    this.logEvent('game_menu_about_cta', ANALYTICS_GAME_MENU_ABOUT_CTA_ID);
  }
  public LogGameMenuSaveCTA(): void {
    this.logEvent('game_menu_save_cta', ANALYTICS_GAME_MENU_SAVE_CTA_ID);
  }

  public LogRestoreCTA(): void {
    this.logEvent('restore_cta', ANALYTICS_RESTORE_CTA_ID);
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
