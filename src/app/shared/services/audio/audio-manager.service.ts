import { Injectable } from '@angular/core';
import { AudioType, AUDIO_LIST } from './audio-info';
import { Howl, Howler } from 'howler';
import { MINIMUM_MATCH_COUNT } from 'src/app/game/game-constants';
import { AppVisibilityService } from '../app-visibility.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioManagerService {
  private readonly ProgressionMin = 48;
  private readonly ProgressionMax = 71;
  private _progressionNext: number = this.ProgressionMin;

  private _trackVolume: number = 0.5;
  get Volume(): number {
    return this._trackVolume;
  }
  set Volume(gainLevel: number) {
    this._trackVolume = gainLevel;
    Howler.volume(this._trackVolume);
  }

  private _visiblySubscription!: Subscription;

  constructor(private appVisibility: AppVisibilityService) {
    this._visiblySubscription = this.appVisibility.VisibilityChanged.subscribe((isVisible) => {
      Howler.mute(!isVisible);
    });
  }

  public PlayLevelComplete(): void {
    switch (Math.floor(Math.random() * 3) + 1) {
      case 1:
        this.PlayAudio(AudioType.LEVEL_END_1);
        break;

      case 2:
        this.PlayAudio(AudioType.LEVEL_END_2);
        break;

      default:
        this.PlayAudio(AudioType.LEVEL_END_3);
    }
  }

  public StopLevelComplete(): void {
    this.StopAudio(AudioType.LEVEL_END_1);
    this.StopAudio(AudioType.LEVEL_END_2);
    this.StopAudio(AudioType.LEVEL_END_3);
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

  public StartProgression(): void {
    this._progressionNext = this.ProgressionMin;
  }

  public PlayAudio(audioType: AudioType, useNote: boolean = false, loop: boolean = false): void {
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
    this.StartProgression();
    let targetNote = 0;
    for (let i = 0; i < matchLength - MINIMUM_MATCH_COUNT; i++) {
      targetNote = this.nextProgression;
    }
    this.PlayAudio(AudioType.MATCH_LONG, true);
  }

  public StopAudio(audioType: AudioType): void {
    const target = AUDIO_LIST.find((a) => a.audioType === audioType);
    if (target) {
      target.howl?.stop();
    }
  }

  private playLoadedAudio(target: Howl, useNote: boolean, loop: boolean): void {
    target.loop(loop);
    target.rate(useNote ? this.nextProgression : 1);
    target.play();
  }

  private get nextProgression(): number {
    this._progressionNext++;
    if (this._progressionNext > this.ProgressionMax) {
      this._progressionNext = this.ProgressionMin;
    }
    return Math.pow(2, (this._progressionNext - 60) / 12);
  }

  OnDestroy() {
    this._visiblySubscription.unsubscribe();
  }
}
