import { Injectable, OnDestroy } from '@angular/core';
import { AudioType, AUDIO_LIST } from './audio-info';
import { Howl, Howler } from 'howler';
import { MINIMUM_MATCH_COUNT } from 'src/app/game/game-constants';
import { AppVisibilityService } from '../app-visibility.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AudioManagerService implements OnDestroy {
  private readonly NOTE_MIN = 48;
  private readonly NOTE_MAX = 71;
  private _noteNext: number = this.NOTE_MIN;

  private _currentLevelCompleteInx = 0;

  // private _trackVolume: number = 0.5;
  // get Volume(): number {
  //   return this._trackVolume;
  // }
  // set Volume(gainLevel: number) {
  //   this._trackVolume = gainLevel;
  //   Howler.volume(this._trackVolume);
  // }

  private _visiblySubscription!: Subscription;

  constructor(private appVisibility: AppVisibilityService) {
    this._visiblySubscription = this.appVisibility.VisibilityChanged.subscribe((isVisible) => {
      Howler.mute(!isVisible);
    });
  }

  public PlayLevelComplete(initialLevel = false): void {
    this._currentLevelCompleteInx = 2;
    if (!initialLevel) {
      this._currentLevelCompleteInx = Math.floor(Math.random() * 7) + 1;
    }

    if (!environment.production) {
      console.info('Level Complete Sound Index: ', this._currentLevelCompleteInx);
    }

    switch (this._currentLevelCompleteInx) {
      case 1:
        this.PlayAudio(AudioType.LEVEL_END_1);
        break;

      case 2:
        this.PlayAudio(AudioType.LEVEL_END_2);
        break;

      case 3:
        this.PlayAudio(AudioType.LEVEL_END_3);
        break;

      case 4:
        this.PlayAudio(AudioType.LEVEL_END_4);
        break;

      case 5:
        this.PlayAudio(AudioType.LEVEL_END_5);
        break;

      case 6:
        this.PlayAudio(AudioType.LEVEL_END_6);
        break;

      case 7:
        this.PlayAudio(AudioType.LEVEL_END_7);
    }
  }

  public StopLevelComplete(): void {
    switch (this._currentLevelCompleteInx) {
      case 1:
        this.StopAudio(AudioType.LEVEL_END_1);
        break;
      case 2:
        this.StopAudio(AudioType.LEVEL_END_2);
        break;
      case 3:
        this.StopAudio(AudioType.LEVEL_END_3);
        break;
      case 4:
        this.StopAudio(AudioType.LEVEL_END_4);
        break;
      case 5:
        this.StopAudio(AudioType.LEVEL_END_5);
        break;
      case 6:
        this.StopAudio(AudioType.LEVEL_END_6);
        break;
      case 7:
        this.StopAudio(AudioType.LEVEL_END_7);
        break;
    }
  }

  public PlayLevelStart(): void {
    switch (Math.floor(Math.random() * 5) + 1) {
      case 1:
        this.PlayAudio(AudioType.LEVEL_START_1);
        break;
      case 2:
        this.PlayAudio(AudioType.LEVEL_START_2);
        break;
      case 3:
        this.PlayAudio(AudioType.LEVEL_START_3);
        break;
      case 4:
        this.PlayAudio(AudioType.LEVEL_START_4);
        break;
      default:
        this.PlayAudio(AudioType.LEVEL_START_5);
    }
  }

  public SetMinNote(): void {
    this._noteNext = this.NOTE_MIN;
  }

  public PlayAudio(audioType: AudioType, useNote = false, loop = false): void {
    const target = AUDIO_LIST.find((audioTrack) => audioTrack.audioType === audioType);
    if (target) {
      if (target.howl) {
        this.playLoadedAudio(target.howl, useNote, loop);
      } else {
        target.howl = new Howl({ src: target.url });
        target.howl.on('load', () => {
          if (target.howl) {
            this.playLoadedAudio(target.howl, useNote, loop);
          }
        });
      }
    }
  }

  public PlayLongMatch(matchLength: number): void {
    this.SetMinNote();
    for (let i = 0; i < matchLength - MINIMUM_MATCH_COUNT; i++) {
      this.nextNote;
    }
    this.PlayAudio(AudioType.MATCH_LONG, true);
  }

  public StopAudio(audioType: AudioType): void {
    const target = AUDIO_LIST.find((a) => a.audioType === audioType);
    target?.howl?.stop();
  }

  private playLoadedAudio(target: Howl, useNote: boolean, loop: boolean): void {
    target.loop(loop);
    target.rate(useNote ? this.nextNote : 1);
    target.play();
  }

  private get nextNote(): number {
    this._noteNext++;
    if (this._noteNext > this.NOTE_MAX) {
      this._noteNext = this.NOTE_MIN;
    }
    return Math.pow(2, (this._noteNext - 60) / 12);
  }

  ngOnDestroy(): void {
    this._visiblySubscription.unsubscribe();
  }
}
