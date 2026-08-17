import { Component, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AudioType } from '../../../../../shared/services/audio/audio-data';
import { AudioManagerService } from '../../../../../shared/services/audio/audio-manager';
import { HighScoreManagerService } from '../../../../../shared/services/high-score-manager';
import { StorageService } from '../../../../../shared/services/storage/storage.service';
import { HapticsManagerService } from '../../../../../shared/services/haptics-manager';
import { AnalyticsEventType, AnalyticsManagerService } from '../../../../../shared/services/analytics-manager';

@Component({
  selector: 'wgl-user-settings',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatExpansionModule,
  ],
  templateUrl: './user-settings.html',
  styleUrl: './user-settings.scss',
})
export class UserSettings implements OnDestroy {
  private audioManager = inject(AudioManagerService);
  private highScoreManager = inject(HighScoreManagerService);
  private storageService = inject(StorageService);
  private hapticsManager = inject(HapticsManagerService);
  private analyticsManager = inject(AnalyticsManagerService);
  private dialogRef = inject(MatDialogRef<UserSettings>);

  gameVolume = signal<number>(Math.round(this.audioManager.GetGameVolume() * 100));
  musicVolume = signal<number>(Math.round(this.audioManager.GetMusicVolume() * 100));
  scoresCleared = signal<boolean>(false);
  confirmClear = signal<boolean>(false);
  confirmFactoryReset = signal<boolean>(false);
  factoryResetCompleted = signal<boolean>(false);

  private musicPreviewTimeout?: ReturnType<typeof setTimeout>;

  gameIcon = computed(() => (this.gameVolume() === 0 ? 'volume_off' : 'volume_up'));
  musicIcon = computed(() => (this.musicVolume() === 0 ? 'music_off' : 'music_note'));
  isHapticsAvailable = computed(() => this.hapticsManager.isAvailable);
  hapticsEnabled = computed(() => this.hapticsManager.hapticsEnabled);

  onHapticsChange(enabled: boolean): void {
    this.hapticsManager.HapticsEnabled = enabled;
    this.analyticsManager.Log(AnalyticsEventType.SettingsHapticsChanged, { enabled });
  }

  onGameVolumeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.gameVolume.set(val);
    this.audioManager.SetGameVolume(val / 100);
  }

  onGameVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.gameVolume.set(val);
    this.audioManager.SetGameVolume(val / 100);
    this.audioManager.PlayAudio(AudioType.LEVEL_STAT);
    this.analyticsManager.Log(AnalyticsEventType.SettingsGameVolumeChanged, { volume: val });
  }

  onMusicVolumeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.musicVolume.set(val);
    this.audioManager.SetMusicVolume(val / 100);
  }

  onMusicVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.musicVolume.set(val);
    this.audioManager.SetMusicVolume(val / 100);

    if (this.musicPreviewTimeout) {
      clearTimeout(this.musicPreviewTimeout);
    }
    this.audioManager.StopAudio(AudioType.LEVEL_END_7);
    this.audioManager.PlayAudio(AudioType.LEVEL_END_7, false, false, 2.0);

    this.musicPreviewTimeout = setTimeout(() => {
      this.audioManager.StopAudio(AudioType.LEVEL_END_7);
    }, 2500);

    this.analyticsManager.Log(AnalyticsEventType.SettingsMusicVolumeChanged, { volume: val });
  }

  onPromptClearHighScores(): void {
    this.confirmClear.set(true);
  }

  onConfirmClearHighScores(): void {
    this.highScoreManager.ClearHighScores();
    this.scoresCleared.set(true);
    this.confirmClear.set(false);
    this.analyticsManager.Log(AnalyticsEventType.SettingsClearHighScores);
  }

  onCancelClearHighScores(): void {
    this.confirmClear.set(false);
  }

  onPromptFactoryReset(): void {
    this.confirmFactoryReset.set(!this.confirmFactoryReset());
  }

  onConfirmFactoryReset(): void {
    this.storageService.clear();
    this.scoresCleared.set(true);
    this.confirmClear.set(false);
    this.confirmFactoryReset.set(false);
    this.factoryResetCompleted.set(true);
    this.analyticsManager.Log(AnalyticsEventType.SettingsFactoryReset);

    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  onCancelFactoryReset(): void {
    this.confirmFactoryReset.set(false);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.musicPreviewTimeout) {
      clearTimeout(this.musicPreviewTimeout);
    }
    this.audioManager.StopAudio(AudioType.LEVEL_END_7);
  }
}

export { UserSettings as UserSettingsComponent };
