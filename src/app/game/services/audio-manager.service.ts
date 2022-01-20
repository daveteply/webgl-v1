import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { MathUtils } from 'three';
import { AudioType, AUDIO_LIST } from '../models/audio-info';

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

  public async PlayAudio(audioType: AudioType): Promise<void> {
    if (!this._isCompatible) {
      return;
    }

    if (this._audioContext && this._audioContext.state === 'suspended') {
      await this._audioContext.resume();
    }

    const target = AUDIO_LIST.find((a) => a.audioType === audioType);
    if (target) {
      target.element.currentTime = 0;
      target.element.play();
    }
  }

  public StopAudio(audioType: AudioType): void {
    const target = AUDIO_LIST.find((a) => a.audioType === audioType);
    if (target) {
      target.element.pause();
      target.element.currentTime = 0;
    }
  }

  private loadAudioFiles(): void {
    AUDIO_LIST.forEach((audio) => {
      audio.track = this._audioContext.createMediaElementSource(audio.element);
      audio.track.connect(this._audioContext.destination);
    });
  }
}
