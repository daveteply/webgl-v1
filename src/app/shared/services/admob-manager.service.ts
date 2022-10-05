import { EventEmitter, Injectable } from '@angular/core';
import {
  AdMob,
  AdMobError,
  AdOptions,
  BannerAdOptions,
  BannerAdPosition,
  BannerAdSize,
  InterstitialAdPluginEvents,
  MaxAdContentRating,
} from '@capacitor-community/admob';
import { Device } from '@capacitor/device';
import { LEVEL_START_FULL_ADS } from 'src/app/game/game-constants';
import { environment } from 'src/environments/environment';

enum AdType {
  None = 1,
  Banner,
  Intersticial,
}

@Injectable({
  providedIn: 'root',
})
export class AdmobManagerService {
  private readonly TESTING: boolean = true;

  private _currentAdType!: AdType;
  private _interstitialPrepared: boolean = false;

  private _isWeb: boolean = false;

  get IsInterstitial(): boolean {
    return this._currentAdType === AdType.Intersticial;
  }

  private _bannerOptions: BannerAdOptions = {
    adId: 'ca-app-pub-1853036438410639/9624528752',
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 40,
    isTesting: this.TESTING,
  };

  private _interstitialOptions: AdOptions = {
    adId: 'ca-app-pub-1853036438410639/8812975467',
    isTesting: this.TESTING,
  };

  // events
  public InterstitialFailed: EventEmitter<void> = new EventEmitter();
  public InterstitialDismissed: EventEmitter<void> = new EventEmitter();

  constructor() {
    Device.getInfo().then((info) => {
      this._isWeb = info.platform === 'web';
    });

    AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: true,
      maxAdContentRating: MaxAdContentRating.ParentalGuidance,
    });

    // events
    AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error: AdMobError) => {
      console.info(error);
      this.InterstitialFailed.next();
    });
    AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (error: AdMobError) => {
      console.info(error);
      this.InterstitialFailed.next();
    });
    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      this.InterstitialDismissed.next();
    });
  }

  public NextAd(level: number): void {
    this._currentAdType = this.nextAdType(level);
    if (!environment.production) {
      console.info('Ad Type:', AdType[this._currentAdType]);
    }

    if (this._currentAdType === AdType.Banner) {
      AdMob.showBanner(this._bannerOptions);
    }

    // prep interstitial
    if (this._currentAdType === AdType.Intersticial) {
      this._interstitialPrepared = false;
      AdMob.prepareInterstitial(this._interstitialOptions).then(() => {
        this._interstitialPrepared = true;
      });
    }
  }

  public NextInterstitialAd() {
    if (this._currentAdType === AdType.Intersticial) {
      if (this._interstitialPrepared) {
        AdMob.showInterstitial();
      } else {
        // something went wrong, fire event to load next level
        this.InterstitialFailed.next();
      }
    }
  }

  public CloseBanner(): void {
    if (this._currentAdType === AdType.Banner) {
      AdMob.removeBanner();
    }
  }

  private nextAdType(level: number): AdType {
    let adType = AdType.None;

    if (level >= LEVEL_START_FULL_ADS || Math.floor(Math.random() * 4) >= 1) {
      adType = AdType.Banner;

      if (!this._isWeb && Math.floor(Math.random() * 3) === 0) {
        adType = AdType.Intersticial;
      }
    }

    return adType;
  }
}
