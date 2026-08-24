import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSettings } from './user-settings';
import { MatDialogRef } from '@angular/material/dialog';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HapticsManagerService } from '../../../../../shared/services/haptics-manager';
import { AudioType } from '../../../../../shared/services/audio/audio-data';
import { AudioManagerService } from '../../../../../shared/services/audio/audio-manager';
import { AnalyticsEventType, AnalyticsManagerService } from '../../../../../shared/services/analytics-manager';
import { HintsManagerService } from '../../../../services/hints-manager';

describe('UserSettings', () => {
  let component: UserSettings;
  let fixture: ComponentFixture<UserSettings>;
  let hapticsManager: HapticsManagerService;
  let analyticsManager: AnalyticsManagerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSettings],
      providers: [
        {
          provide: MatDialogRef,
          useValue: { close: vi.fn() },
        },
      ],
    }).compileComponents();

    analyticsManager = TestBed.inject(AnalyticsManagerService);
    vi.spyOn(analyticsManager, 'Log');

    fixture = TestBed.createComponent(UserSettings);
    component = fixture.componentInstance;
    hapticsManager = TestBed.inject(HapticsManagerService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle haptics setting via hapticsManager and log SettingsHapticsChanged', () => {
    const hapticsSpy = vi.spyOn(hapticsManager, 'HapticsEnabled', 'set');
    component.onHapticsChange(false);
    expect(hapticsSpy).toHaveBeenCalledWith(false);
    expect(analyticsManager.Log).toHaveBeenCalledWith(AnalyticsEventType.SettingsHapticsChanged, { enabled: false });
  });

  it('should render disabled toggle and notice when haptic feedback is not available', () => {
    vi.spyOn(hapticsManager, 'isAvailable', 'get').mockReturnValue(false);
    fixture.detectChanges();

    const noteEl = fixture.nativeElement.querySelector('.haptics-unavailable-note');
    const toggleEl = fixture.nativeElement.querySelector('mat-slide-toggle');

    expect(noteEl).toBeTruthy();
    expect(noteEl.textContent.trim()).toBe('Haptic feedback is not available');
    expect(toggleEl).toBeTruthy();
    expect(component.isHapticsAvailable()).toBe(false);
  });

  it('should update game volume on input without playing audio', () => {
    const audioManager = TestBed.inject(AudioManagerService);
    const setGameVolumeSpy = vi.spyOn(audioManager, 'SetGameVolume');
    const playAudioSpy = vi.spyOn(audioManager, 'PlayAudio');

    const fakeEvent = { target: { value: '75' } } as unknown as Event;
    component.onGameVolumeInput(fakeEvent);

    expect(component.gameVolume()).toBe(75);
    expect(setGameVolumeSpy).toHaveBeenCalledWith(0.75);
    expect(playAudioSpy).not.toHaveBeenCalled();
  });

  it('should play AudioType.LEVEL_STAT and log SettingsGameVolumeChanged when game volume changes', () => {
    const audioManager = TestBed.inject(AudioManagerService);
    const setGameVolumeSpy = vi.spyOn(audioManager, 'SetGameVolume');
    const playAudioSpy = vi.spyOn(audioManager, 'PlayAudio');

    const fakeEvent = { target: { value: '80' } } as unknown as Event;
    component.onGameVolumeChange(fakeEvent);

    expect(component.gameVolume()).toBe(80);
    expect(setGameVolumeSpy).toHaveBeenCalledWith(0.8);
    expect(playAudioSpy).toHaveBeenCalledWith(AudioType.LEVEL_STAT);
    expect(analyticsManager.Log).toHaveBeenCalledWith(AnalyticsEventType.SettingsGameVolumeChanged, { volume: 80 });
  });

  it('should update music volume on input without playing audio', () => {
    const audioManager = TestBed.inject(AudioManagerService);
    const setMusicVolumeSpy = vi.spyOn(audioManager, 'SetMusicVolume');
    const playAudioSpy = vi.spyOn(audioManager, 'PlayAudio');

    const fakeEvent = { target: { value: '40' } } as unknown as Event;
    component.onMusicVolumeInput(fakeEvent);

    expect(component.musicVolume()).toBe(40);
    expect(setMusicVolumeSpy).toHaveBeenCalledWith(0.4);
    expect(playAudioSpy).not.toHaveBeenCalled();
  });

  it('should play AudioType.LEVEL_END_7 preview and log SettingsMusicVolumeChanged on music volume change', () => {
    const audioManager = TestBed.inject(AudioManagerService);
    const setMusicVolumeSpy = vi.spyOn(audioManager, 'SetMusicVolume');
    const playAudioSpy = vi.spyOn(audioManager, 'PlayAudio');
    const stopAudioSpy = vi.spyOn(audioManager, 'StopAudio');

    const fakeEvent = { target: { value: '60' } } as unknown as Event;
    component.onMusicVolumeChange(fakeEvent);

    expect(component.musicVolume()).toBe(60);
    expect(setMusicVolumeSpy).toHaveBeenCalledWith(0.6);
    expect(stopAudioSpy).toHaveBeenCalledWith(AudioType.LEVEL_END_7);
    expect(playAudioSpy).toHaveBeenCalledWith(AudioType.LEVEL_END_7, false, false, 2.0);
    expect(analyticsManager.Log).toHaveBeenCalledWith(AnalyticsEventType.SettingsMusicVolumeChanged, { volume: 60 });
  });

  it('should log SettingsClearHighScores on confirm clear high scores', () => {
    component.onConfirmClearHighScores();
    expect(analyticsManager.Log).toHaveBeenCalledWith(AnalyticsEventType.SettingsClearHighScores);
  });

  it('should reset tutorial hints when onResetTutorialHints is called', () => {
    const hintsManager = TestBed.inject(HintsManagerService);
    const resetSpy = vi.spyOn(hintsManager, 'ResetAllTutorials');

    component.onResetTutorialHints();
    expect(resetSpy).toHaveBeenCalled();
    expect(component.hintsReset()).toBe(true);
    expect(component.hintsSkipped()).toBe(false);
  });

  it('should skip tutorial hints when onSkipTutorialHints is called', () => {
    const hintsManager = TestBed.inject(HintsManagerService);
    const skipSpy = vi.spyOn(hintsManager, 'SkipAllTutorials');

    component.onSkipTutorialHints();
    expect(skipSpy).toHaveBeenCalled();
    expect(component.hintsSkipped()).toBe(true);
    expect(component.hintsReset()).toBe(false);
  });
});
