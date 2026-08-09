import { Component, OnDestroy, inject } from '@angular/core';
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
  private dialogRef = inject(MatDialogRef<UserSettings>);

  gameVolume = Math.round(this.audioManager.GetGameVolume() * 100);
  musicVolume = Math.round(this.audioManager.GetMusicVolume() * 100);
  scoresCleared = false;
  confirmClear = false;
  confirmFactoryReset = false;
  factoryResetCompleted = false;

  private musicPreviewTimeout?: ReturnType<typeof setTimeout>;

  get gameIcon(): string {
    return this.gameVolume === 0 ? 'volume_off' : 'volume_up';
  }

  get musicIcon(): string {
    return this.musicVolume === 0 ? 'music_off' : 'music_note';
  }

  get isHapticsAvailable(): boolean {
    return this.hapticsManager.isAvailable;
  }

  get hapticsEnabled(): boolean {
    return this.hapticsManager.hapticsEnabled;
  }

  onHapticsChange(enabled: boolean): void {
    this.hapticsManager.HapticsEnabled = enabled;
  }

  onGameVolumeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.gameVolume = val;
    this.audioManager.SetGameVolume(val / 100);
  }

  onGameVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.gameVolume = val;
    this.audioManager.SetGameVolume(val / 100);
    this.audioManager.PlayAudio(AudioType.LEVEL_STAT);
  }

  onMusicVolumeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.musicVolume = val;
    this.audioManager.SetMusicVolume(val / 100);
  }

  onMusicVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.musicVolume = val;
    this.audioManager.SetMusicVolume(val / 100);

    if (this.musicPreviewTimeout) {
      clearTimeout(this.musicPreviewTimeout);
    }
    this.audioManager.StopAudio(AudioType.LEVEL_END_7);
    this.audioManager.PlayAudio(AudioType.LEVEL_END_7, false, false, 2.0);

    this.musicPreviewTimeout = setTimeout(() => {
      this.audioManager.StopAudio(AudioType.LEVEL_END_7);
    }, 2500);
  }

  onPromptClearHighScores(): void {
    this.confirmClear = true;
  }

  onConfirmClearHighScores(): void {
    this.highScoreManager.ClearHighScores();
    this.scoresCleared = true;
    this.confirmClear = false;
  }

  onCancelClearHighScores(): void {
    this.confirmClear = false;
  }

  onPromptFactoryReset(): void {
    this.confirmFactoryReset = !this.confirmFactoryReset;
  }

  onConfirmFactoryReset(): void {
    this.storageService.clear();
    this.scoresCleared = true;
    this.confirmClear = false;
    this.confirmFactoryReset = false;
    this.factoryResetCompleted = true;

    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  onCancelFactoryReset(): void {
    this.confirmFactoryReset = false;
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
