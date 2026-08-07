import { Injectable, OnDestroy, inject, isDevMode } from '@angular/core';
import { AudioType, AUDIO_LIST, BACKGROUND_MUSIC_AUDIO_TYPES } from './audio-data';
import {
  MINIMUM_MATCH_COUNT,
  STORAGE_SETTINGS_GAME_VOLUME,
  STORAGE_SETTINGS_MUSIC_VOLUME,
} from '../../../game/game-constants';
import { AppVisibilityService } from '../app-visibility';
import { StorageService } from '../storage/storage.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioManagerService implements OnDestroy {
  private appVisibility = inject(AppVisibilityService);
  private storageService = inject(StorageService);

  private readonly NOTE_MIN = 48;
  private readonly NOTE_MAX = 71;
  private _noteNext: number = this.NOTE_MIN;

  private _currentLevelCompleteInx = 0;
  private _visiblySubscription!: Subscription;

  // Native Web Audio API Context & Gain Nodes
  private _audioCtx?: AudioContext;
  private _masterGain?: GainNode;
  private _gameGain?: GainNode;
  private _musicGain?: GainNode;

  // Volume state (default 50% = 0.5 if not found in storage)
  private _gameVolume: number;
  private _musicVolume: number;

  // Cached decoded AudioBuffers for instant playback
  private _bufferCache = new Map<AudioType, AudioBuffer>();

  // Currently playing active sources (for looping sounds like panic audio)
  private _activeSources = new Map<AudioType, AudioBufferSourceNode>();

  constructor() {
    const savedGameVol = this.storageService.getItem<number>(STORAGE_SETTINGS_GAME_VOLUME);
    this._gameVolume = savedGameVol !== null && savedGameVol !== undefined ? savedGameVol : 0.5;

    const savedMusicVol = this.storageService.getItem<number>(STORAGE_SETTINGS_MUSIC_VOLUME);
    this._musicVolume = savedMusicVol !== null && savedMusicVol !== undefined ? savedMusicVol : 0.5;

    this._visiblySubscription = this.appVisibility.VisibilityChanged.subscribe((isVisible) => {
      if (this._masterGain && this._audioCtx) {
        this._masterGain.gain.setValueAtTime(isVisible ? 1 : 0, this._audioCtx.currentTime);
      }
    });
  }

  public GetGameVolume(): number {
    return this._gameVolume;
  }

  public SetGameVolume(vol: number): void {
    this._gameVolume = Math.max(0, Math.min(1, vol));
    this.storageService.setItem(STORAGE_SETTINGS_GAME_VOLUME, this._gameVolume);
    if (this._gameGain && this._audioCtx) {
      this._gameGain.gain.setValueAtTime(this._gameVolume, this._audioCtx.currentTime);
    }
  }

  public GetMusicVolume(): number {
    return this._musicVolume;
  }

  public SetMusicVolume(vol: number): void {
    this._musicVolume = Math.max(0, Math.min(1, vol));
    this.storageService.setItem(STORAGE_SETTINGS_MUSIC_VOLUME, this._musicVolume);
    if (this._musicGain && this._audioCtx) {
      this._musicGain.gain.setValueAtTime(this._musicVolume, this._audioCtx.currentTime);
    }
  }

  private initAudioContext(): AudioContext | undefined {
    if (!this._audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this._audioCtx = new AudioCtxClass();

        this._masterGain = this._audioCtx.createGain();
        this._masterGain.connect(this._audioCtx.destination);

        this._gameGain = this._audioCtx.createGain();
        this._gameGain.gain.setValueAtTime(this._gameVolume, this._audioCtx.currentTime);
        this._gameGain.connect(this._masterGain);

        this._musicGain = this._audioCtx.createGain();
        this._musicGain.gain.setValueAtTime(this._musicVolume, this._audioCtx.currentTime);
        this._musicGain.connect(this._masterGain);

        this.attachUserGestureResume();
      }
    }
    if (this._audioCtx && this._audioCtx.state === 'suspended') {
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
    if (!ctx) return;
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
    this.StopAudio(audioType);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    source.loop = loop;

    const isMusic = BACKGROUND_MUSIC_AUDIO_TYPES.has(audioType);
    const targetGain = isMusic ? this._musicGain : this._gameGain;

    if (targetGain) {
      source.connect(targetGain);
    } else if (this._masterGain) {
      source.connect(this._masterGain);
    } else {
      source.connect(ctx.destination);
    }

    source.start(0);
    this._activeSources.set(audioType, source);
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
