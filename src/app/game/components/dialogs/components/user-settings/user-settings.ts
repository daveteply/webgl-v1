import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { AudioManagerService } from '../../../../../shared/services/audio/audio-manager';
import { HighScoreManagerService } from '../../../../../shared/services/high-score-manager';
import { StorageService } from '../../../../../shared/services/storage/storage.service';

@Component({
  selector: 'wgl-user-settings',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatSliderModule, MatExpansionModule],
  templateUrl: './user-settings.html',
  styleUrl: './user-settings.scss',
})
export class UserSettings {
  private audioManager = inject(AudioManagerService);
  private highScoreManager = inject(HighScoreManagerService);
  private storageService = inject(StorageService);
  private dialogRef = inject(MatDialogRef<UserSettings>);

  gameVolume = Math.round(this.audioManager.GetGameVolume() * 100);
  musicVolume = Math.round(this.audioManager.GetMusicVolume() * 100);
  scoresCleared = false;
  confirmClear = false;
  confirmFactoryReset = false;
  factoryResetCompleted = false;

  get gameIcon(): string {
    return this.gameVolume === 0 ? 'volume_off' : 'volume_up';
  }

  get musicIcon(): string {
    return this.musicVolume === 0 ? 'music_off' : 'music_note';
  }

  onGameVolumeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.gameVolume = val;
    this.audioManager.SetGameVolume(val / 100);
  }

  onMusicVolumeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.musicVolume = val;
    this.audioManager.SetMusicVolume(val / 100);
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
}

export { UserSettings as UserSettingsComponent };
