import { Injectable } from '@angular/core';
import { MathUtils } from 'three';
import { AudioType, AUDIO_LIST } from './audio-info';
import { Howl, Howler } from 'howler';

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

  public PlayLevelComplete(): void {
    switch (MathUtils.randInt(1, 3)) {
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
    this.StopMusic(AudioType.LEVEL_END_1);
    this.StopMusic(AudioType.LEVEL_END_2);
    this.StopMusic(AudioType.LEVEL_END_3);
  }

  public PlayAudio(audioType: AudioType, useNote: boolean = false): void {
    const target = AUDIO_LIST.find(
      (audioTrack) => audioTrack.audioType === audioType
    );
    if (target) {
      if (target.howl) {
        this.playLoadedAudio(target.howl, useNote);
      } else {
        target.howl = new Howl({ src: target.url });
        target.howl.on('load', () => {
          if (target.howl) {
            this.playLoadedAudio(target.howl, useNote);
          }
        });
      }
    }
  }

  public StopMusic(audioType: AudioType): void {
    const target = AUDIO_LIST.find((a) => a.audioType === audioType);
    if (target) {
      target.howl?.stop();
    }
  }

  public StartProgression(): void {
    this._progressionNext = this.ProgressionMin;
  }

  private playLoadedAudio(target: Howl, useNote: boolean): void {
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
}