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
  private readonly TESTING: boolean = false;

  private _currentAdType!: AdType;

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

  public NextAd(): void {
    this._currentAdType = this.nextAdType();
    if (!environment.production) {
      console.info('Ad Type:', AdType[this._currentAdType]);
    }

    if (this._currentAdType === AdType.Banner) {
      AdMob.showBanner(this._bannerOptions);
    }
  }

  public NextInterstitialAd() {
    if (this._currentAdType === AdType.Intersticial) {
      AdMob.prepareInterstitial(this._interstitialOptions).then(() => {
        AdMob.showInterstitial();
      });
    }
  }

  public CloseBanner(): void {
    if (this._currentAdType === AdType.Banner) {
      AdMob.removeBanner();
    }
  }

  private nextAdType(): AdType {
    let adType = AdType.None;

    // 50% chance that an ad will be shown
    if (Math.floor(Math.random() * 2) === 0) {
      adType = AdType.Banner;

      // 25% chance that ad will be interstitial
      if (Math.floor(Math.random() * 4) === 0) {
        adType = AdType.Intersticial;
      }
    }

    return adType;
  }
}
