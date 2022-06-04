import { Injectable } from '@angular/core';
import {
  AdMob,
  AdMobBannerSize,
  BannerAdOptions,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
} from '@capacitor-community/admob';

@Injectable({
  providedIn: 'root',
})
export class AdmobManagerService {
  private _bannerOptions: BannerAdOptions = {
    adId: 'ca-app-pub-1853036438410639/9624528752',
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 40,
    isTesting: false,
  };

  constructor() {
    AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: true,
    });
  }

  public ShowBanner(): void {
    console.info('show ad banner');
    AdMob.showBanner(this._bannerOptions);
  }

  public RemoveBanner(): void {
    AdMob.removeBanner();
  }
}
