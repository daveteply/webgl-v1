import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { MathUtils } from 'three';
import {
  AudioType,
  END_LEVEL_MUSIC,
  MusicInfo,
  SOUND_FX_LIST,
} from '../models/audio-info';

@Injectable()
export class AudioManagerService {
  private _audioContext!: AudioContext;
  private _isCompatible: boolean = true;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  public InitWebAudioApi(): void {
    try {
      const win = this.document.defaultView;
      if (win) {
        this._audioContext = new win['AudioContext']();
        this.loadAudioFiles();
      }
    } catch (error) {
      console.error('Could not init web audio context', error);
      this._isCompatible = false;
    }
  }

  public PlayLevelComplete(): void {
    switch (MathUtils.randInt(1, 3)) {
      case 1:
        this.PlayMusic(AudioType.LEVEL_END_1);
        break;

      case 2:
        this.PlayMusic(AudioType.LEVEL_END_2);
        break;

      default:
        this.PlayMusic(AudioType.LEVEL_END_3);
    }
  }

  public StopLevelComplete(): void {
    this.StopMusic(AudioType.LEVEL_END_1);
    this.StopMusic(AudioType.LEVEL_END_2);
    this.StopMusic(AudioType.LEVEL_END_3);
  }

  public async PlayAudio(audioType: AudioType): Promise<void> {
    if (!this._isCompatible) {
      return;
    }

    if (this._audioContext && this._audioContext.state === 'suspended') {
      await this._audioContext.resume();
    }

    const target = SOUND_FX_LIST.find((a) => a.audioType === audioType);
    if (target) {
      target.element.currentTime = 0;
      target.element.play();
    }
  }

  public async PlayMusic(audioType: AudioType): Promise<void> {
    if (this._isCompatible && this._audioContext) {
      if (this._audioContext.state === 'suspended') {
        await this._audioContext.resume();
      }
      const target = END_LEVEL_MUSIC.find(
        (musicTrack) => musicTrack.audioType === audioType
      );
      if (target) {
        if (target.element.duration) {
          target.element.currentTime = 0;
          target.element.play();
        } else {
          // load and play
          this.connectMusicFile(target);
        }
      }
    }
  }

  public StopMusic(audioType: AudioType): void {
    const target = END_LEVEL_MUSIC.find((a) => a.audioType === audioType);
    if (target) {
      target.element.pause();
      target.element.currentTime = 0;
    }
  }

  private connectMusicFile(info: MusicInfo): void {
    info.element.src = info.src;
    info.element.load();
    info.element.addEventListener('loadeddata', () => {
      info.track = this._audioContext.createMediaElementSource(info.element);
      info.track.connect(this._audioContext.destination);
      info.element.play();
    });
  }

  private loadAudioFiles(): void {
    SOUND_FX_LIST.forEach((audioFX) => {
      audioFX.track = this._audioContext.createMediaElementSource(
        audioFX.element
      );
      audioFX.track.connect(this._audioContext.destination);
    });
  }
}
