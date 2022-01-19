import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { AudioInfo, AudioType } from '../models/audio-info';

@Injectable()
export class AudioManagerService {
  private _audioContext!: AudioContext;
  private _isCompatible: boolean = true;

  private _audioList: AudioInfo[] = [
    {
      element: new Audio('assets/audio/Movement-06.mp3'),
      audioType: AudioType.LEVEL_START,
    },
    {
      element: new Audio('assets/audio/button-30.mp3'),
      audioType: AudioType.GAME_PIECE_MOVE,
    },
  ];

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

  public async PlayAudio(audioType: AudioType): Promise<void> {
    if (this._audioContext && this._audioContext.state === 'suspended') {
      await this._audioContext.resume();
    }

    const target = this._audioList.find((a) => a.audioType === audioType);
    if (target) {
      target.element.currentTime = 0;
      target.element.play();
    }
  }

  private loadAudioFiles(): void {
    this._audioList.forEach((audio) => {
      audio.track = this._audioContext.createMediaElementSource(audio.element);
      audio.track.connect(this._audioContext.destination);
    });
  }
}
