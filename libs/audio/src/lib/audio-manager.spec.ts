import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioManagerService } from './audio-manager';
import { AudioType, AUDIO_LIST, BACKGROUND_MUSIC_AUDIO_TYPES } from './audio-data';
import { AppVisibilityService, StorageService } from '@rikkle/shared';

describe('AudioManagerService', () => {
  let service: AudioManagerService;
  let mockStorage: StorageService;

  beforeEach(() => {
    mockStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    } as unknown as StorageService;

    TestBed.configureTestingModule({
      providers: [AudioManagerService, { provide: StorageService, useValue: mockStorage }, AppVisibilityService],
    });

    service = TestBed.inject(AudioManagerService);
  });

  it('should initialize with default 50% volumes when no saved settings exist', () => {
    expect(service.GetGameVolume()).toBe(0.5);
    expect(service.GetMusicVolume()).toBe(0.5);
  });

  it('should clamp and persist game volume within [0, 1]', () => {
    service.SetGameVolume(0.8);
    expect(service.GetGameVolume()).toBe(0.8);
    expect(mockStorage.setItem).toHaveBeenCalledWith(expect.any(String), 0.8);

    service.SetGameVolume(1.5);
    expect(service.GetGameVolume()).toBe(1.0);

    service.SetGameVolume(-0.2);
    expect(service.GetGameVolume()).toBe(0);
  });

  it('should clamp and persist music volume within [0, 1]', () => {
    service.SetMusicVolume(0.3);
    expect(service.GetMusicVolume()).toBe(0.3);
    expect(mockStorage.setItem).toHaveBeenCalledWith(expect.any(String), 0.3);

    service.SetMusicVolume(2.0);
    expect(service.GetMusicVolume()).toBe(1.0);
  });

  it('should verify audio data lists contain valid definitions', () => {
    expect(AUDIO_LIST.length).toBeGreaterThan(0);
    expect(BACKGROUND_MUSIC_AUDIO_TYPES.size).toBeGreaterThan(0);

    const gameOverAudio = AUDIO_LIST.find((a) => a.audioType === AudioType.GAME_OVER);
    expect(gameOverAudio).toBeDefined();
    expect(gameOverAudio?.url).toContain('game-over');
  });
});
