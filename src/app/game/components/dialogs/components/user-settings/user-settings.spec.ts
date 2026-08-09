import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSettings } from './user-settings';
import { MatDialogRef } from '@angular/material/dialog';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HapticsManagerService } from '../../../../../shared/services/haptics-manager';
import { AudioType } from '../../../../../shared/services/audio/audio-data';

describe('UserSettings', () => {
  let component: UserSettings;
  let fixture: ComponentFixture<UserSettings>;
  let hapticsManager: HapticsManagerService;

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

    fixture = TestBed.createComponent(UserSettings);
    component = fixture.componentInstance;
    hapticsManager = TestBed.inject(HapticsManagerService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle haptics setting via hapticsManager', () => {
    const hapticsSpy = vi.spyOn(hapticsManager, 'HapticsEnabled', 'set');
    component.onHapticsChange(false);
    expect(hapticsSpy).toHaveBeenCalledWith(false);
  });

  it('should render disabled toggle and notice when haptic feedback is not available', () => {
    vi.spyOn(hapticsManager, 'isAvailable', 'get').mockReturnValue(false);
    fixture.detectChanges();

    const noteEl = fixture.nativeElement.querySelector('.haptics-unavailable-note');
    const toggleEl = fixture.nativeElement.querySelector('mat-slide-toggle');

    expect(noteEl).toBeTruthy();
    expect(noteEl.textContent.trim()).toBe('Haptic feedback is not available');
    expect(toggleEl).toBeTruthy();
    expect(component.isHapticsAvailable).toBe(false);
  });

  it('should update game volume on input without playing audio', () => {
    const audioManager = (component as any).audioManager;
    const setGameVolumeSpy = vi.spyOn(audioManager, 'SetGameVolume');
    const playAudioSpy = vi.spyOn(audioManager, 'PlayAudio');

    const fakeEvent = { target: { value: '75' } } as unknown as Event;
    component.onGameVolumeInput(fakeEvent);

    expect(component.gameVolume).toBe(75);
    expect(setGameVolumeSpy).toHaveBeenCalledWith(0.75);
    expect(playAudioSpy).not.toHaveBeenCalled();
  });

  it('should play AudioType.LEVEL_STAT when game volume selection changes', () => {
    const audioManager = (component as any).audioManager;
    const setGameVolumeSpy = vi.spyOn(audioManager, 'SetGameVolume');
    const playAudioSpy = vi.spyOn(audioManager, 'PlayAudio');

    const fakeEvent = { target: { value: '80' } } as unknown as Event;
    component.onGameVolumeChange(fakeEvent);

    expect(component.gameVolume).toBe(80);
    expect(setGameVolumeSpy).toHaveBeenCalledWith(0.8);
    expect(playAudioSpy).toHaveBeenCalledWith(AudioType.LEVEL_STAT);
  });

  it('should update music volume on input without playing audio', () => {
    const audioManager = (component as any).audioManager;
    const setMusicVolumeSpy = vi.spyOn(audioManager, 'SetMusicVolume');
    const playAudioSpy = vi.spyOn(audioManager, 'PlayAudio');

    const fakeEvent = { target: { value: '40' } } as unknown as Event;
    component.onMusicVolumeInput(fakeEvent);

    expect(component.musicVolume).toBe(40);
    expect(setMusicVolumeSpy).toHaveBeenCalledWith(0.4);
    expect(playAudioSpy).not.toHaveBeenCalled();
  });

  it('should play AudioType.LEVEL_END_7 preview on music volume change', () => {
    const audioManager = (component as any).audioManager;
    const setMusicVolumeSpy = vi.spyOn(audioManager, 'SetMusicVolume');
    const playAudioSpy = vi.spyOn(audioManager, 'PlayAudio');
    const stopAudioSpy = vi.spyOn(audioManager, 'StopAudio');

    const fakeEvent = { target: { value: '60' } } as unknown as Event;
    component.onMusicVolumeChange(fakeEvent);

    expect(component.musicVolume).toBe(60);
    expect(setMusicVolumeSpy).toHaveBeenCalledWith(0.6);
    expect(stopAudioSpy).toHaveBeenCalledWith(AudioType.LEVEL_END_7);
    expect(playAudioSpy).toHaveBeenCalledWith(AudioType.LEVEL_END_7, false, false, 2.0);
  });
});
