import { Injectable, OnDestroy, inject, isDevMode } from '@angular/core';
import { AudioType, AUDIO_LIST } from './audio-info';
import { MINIMUM_MATCH_COUNT } from '../../../game/game-constants';
import { AppVisibilityService } from '../app-visibility';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioManagerService implements OnDestroy {
  private appVisibility = inject(AppVisibilityService);

  private readonly NOTE_MIN = 48;
  private readonly NOTE_MAX = 71;
  private _noteNext: number = this.NOTE_MIN;

  private _currentLevelCompleteInx = 0;
  private _visiblySubscription!: Subscription;

  // Native Web Audio API Context & Master Gain
  private _audioCtx?: AudioContext;
  private _masterGain?: GainNode;

  // Cached decoded AudioBuffers for instant playback
  private _bufferCache = new Map<AudioType, AudioBuffer>();

  // Currently playing active sources (for looping sounds like panic audio)
  private _activeSources = new Map<AudioType, AudioBufferSourceNode>();

  constructor() {
    this._visiblySubscription = this.appVisibility.VisibilityChanged.subscribe((isVisible) => {
      if (this._masterGain && this._audioCtx) {
        this._masterGain.gain.setValueAtTime(isVisible ? 1 : 0, this._audioCtx.currentTime);
      }
    });
  }

  private initAudioContext(): AudioContext {
    if (!this._audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this._audioCtx = new AudioCtxClass();
      this._masterGain = this._audioCtx.createGain();
      this._masterGain.connect(this._audioCtx.destination);
      this.attachUserGestureResume();
    }
    if (this._audioCtx.state === 'suspended') {
      this._audioCtx.resume().catch(() => {
        // Suppress browser autoplay policy warning until initial user interaction
      });
    }
    return this._audioCtx;
  }

  private attachUserGestureResume(): void {
    const resume = () => {
      if (this._audioCtx && this._audioCtx.state === 'suspended') {
        this._audioCtx.resume().catch(() => {});
      }
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
      window.removeEventListener('click', resume);
    };
    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
    window.addEventListener('click', resume, { once: true });
  }

  public PlayLevelComplete(initialLevel = false): void {
    this._currentLevelCompleteInx = 2;
    if (!initialLevel) {
      this._currentLevelCompleteInx = Math.floor(Math.random() * 7) + 1;
    }

    if (isDevMode()) {
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
        break;
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
    if (!target) return;

    const ctx = this.initAudioContext();
    const rate = useNote ? this.nextNote : 1;

    const cachedBuffer = this._bufferCache.get(audioType);
    if (cachedBuffer) {
      this.playBuffer(ctx, audioType, cachedBuffer, rate, loop);
    } else {
      fetch(target.url)
        .then((res) => res.arrayBuffer())
        .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          this._bufferCache.set(audioType, audioBuffer);
          this.playBuffer(ctx, audioType, audioBuffer, rate, loop);
        })
        .catch((err) => {
          if (isDevMode()) {
            console.error(`Failed to load audio ${target.url}:`, err);
          }
        });
    }
  }

  private playBuffer(ctx: AudioContext, audioType: AudioType, buffer: AudioBuffer, rate: number, loop: boolean): void {
    if (loop) {
      this.StopAudio(audioType);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    source.loop = loop;

    if (this._masterGain) {
      source.connect(this._masterGain);
    } else {
      source.connect(ctx.destination);
    }

    source.start(0);

    if (loop) {
      this._activeSources.set(audioType, source);
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
    const active = this._activeSources.get(audioType);
    if (active) {
      try {
        active.stop();
      } catch (e) {
        // no op if already stopped
      }
      this._activeSources.delete(audioType);
    }
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
    this._activeSources.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    this._activeSources.clear();
    this._audioCtx?.close();
  }
}

export { AudioManagerService as AudioManager };
