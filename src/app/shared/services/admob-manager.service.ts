import { EventEmitter, Injectable, NgZone } from '@angular/core';
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
import { LEVEL_START_FULL_ADS } from 'src/app/game/game-constants';
import { environment } from 'src/environments/environment';
import { DeviceManagerService } from './device-manager.service';

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
  private readonly ADS_ENABLED: boolean = true;

  private _currentAdType!: AdType;
  private _interstitialPrepared = false;

  // Feedback is that the Interstitial occurs too often.
  // This will be the target count of ad occurrences
  private _nextInterstitialTarget = 0;
  private readonly INTERSTITIAL_TARGET_MIN: number = 3;
  private readonly INTERSTITIAL_TARGET_MAX: number = 5;

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

  constructor(private ngZone: NgZone, private deviceManagerService: DeviceManagerService) {
    AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: false,
      maxAdContentRating: MaxAdContentRating.ParentalGuidance,
    });

    // events
    AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error: AdMobError) => {
      this.ngZone.run(() => {
        console.error(error);
        this.InterstitialFailed.next();
      });
    });
    AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (error: AdMobError) => {
      this.ngZone.run(() => {
        console.error(error);
        this.InterstitialFailed.next();
      });
    });
    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      this.ngZone.run(() => {
        this.InterstitialDismissed.next();
      });
    });

    this._nextInterstitialTarget = this.nextInterstitialTarget();
  }

  public NextAd(level: number): void {
    this._currentAdType = this.nextAdType(level);

    // disable ads for web
    if (this.deviceManagerService.IsWeb) {
      this._currentAdType = AdType.None;
      if (!environment.production) {
        console.info('  Ads - override none (device is web)');
      }
    }

    if (this._currentAdType === AdType.Banner) {
      if (this.ADS_ENABLED) {
        AdMob.showBanner(this._bannerOptions);
      }
    }

    // prep interstitial
    if (this.ADS_ENABLED && this._currentAdType === AdType.Intersticial) {
      this._interstitialPrepared = false;
      AdMob.prepareInterstitial(this._interstitialOptions).then(() => {
        this._interstitialPrepared = true;
      });
    }
  }

  public NextInterstitialAd() {
    if (this._currentAdType === AdType.Intersticial) {
      if (this.ADS_ENABLED) {
        if (this._interstitialPrepared) {
          AdMob.showInterstitial();
        } else {
          // something went wrong, fire event to load next level
          this.InterstitialFailed.next();
        }
      } else {
        // ads are disabled, fire event
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

    // value is set to > 0 upon construction
    this._nextInterstitialTarget--;

    if (level >= LEVEL_START_FULL_ADS || Math.floor(Math.random() * 4) >= 1) {
      adType = AdType.Banner;

      if (this._nextInterstitialTarget === 0) {
        adType = AdType.Intersticial;
        this._nextInterstitialTarget = this.nextInterstitialTarget();
      }
    }

    if (!environment.production) {
      console.info('Ad Type:', AdType[adType]);
    }

    return adType;
  }

  private nextInterstitialTarget(): number {
    return Math.floor(
      Math.random() * (this.INTERSTITIAL_TARGET_MAX - this.INTERSTITIAL_TARGET_MIN) + this.INTERSTITIAL_TARGET_MIN
    );
  }
}
