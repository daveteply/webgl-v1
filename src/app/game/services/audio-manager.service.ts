import { Injectable } from '@angular/core';
import { MathUtils } from 'three';
import { AudioType, AUDIO_LIST } from '../models/audio-info';

import { Howl } from 'howler';

@Injectable()
export class AudioManagerService {
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

  public async PlayAudio(
    audioType: AudioType,
    useNote: boolean = false
  ): Promise<void> {
    const target = AUDIO_LIST.find(
      (audioTrack) => audioTrack.audioType === audioType
    );
    if (target) {
      if (target.howl) {
        target.howl.rate(
          useNote ? Math.pow(2, (MathUtils.randInt(48, 71) - 60) / 12) : 1
        );
        target.howl.play();
      } else {
        target.howl = new Howl({ src: target.url });
        target.howl.play();
      }
    }
  }

  public StopMusic(audioType: AudioType): void {
    const target = AUDIO_LIST.find((a) => a.audioType === audioType);
    if (target) {
      target.howl?.stop();
    }
  }
}
