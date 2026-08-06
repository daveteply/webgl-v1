import { Component, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { MathUtils } from 'three';

import { GAME_OVER_EMOJI } from '../../../../game-constants';
import { GameOverData } from './game-over-data';
import { TextureManagerService } from '../../../../services/texture/texture-manager';
import { HighScores } from '../../../high-scores/high-scores';
import { ProgressBar } from '../../../../../shared/components/progress-bar/progress-bar';

@Component({
  selector: 'wgl-game-over',
  imports: [CommonModule, MatDialogModule, MatButtonModule, HighScores, ProgressBar],
  templateUrl: './game-over.html',
  styleUrl: './game-over.scss',
})
export class GameOver {
  texturesStillLoading = true;
  progress = 100;

  isLevelOne: boolean;
  gameOverEmoji = String.fromCodePoint(GAME_OVER_EMOJI[MathUtils.randInt(0, GAME_OVER_EMOJI.length - 1)]);

  private textureManager = inject(TextureManagerService);
  private dialogRef = inject(MatDialogRef<GameOver>);
  public data: GameOverData = inject(MAT_DIALOG_DATA);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.textureManager.LevelTexturesLoaded.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((loaded) => {
      if (loaded) {
        this.texturesStillLoading = false;
        this.progress = 100;
        this.cdr.markForCheck();
      }
    });
    this.textureManager.LevelTextureLoadProgress.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((progress) => {
      this.progress = progress;
      this.cdr.markForCheck();
    });

    this.isLevelOne = this.data?.level === 1;
  }

  onCloseGameOver(): void {
    this.data.startOver = true;
    this.dialogRef.close(this.data);
  }

  onCloseRestartLevel(): void {
    this.data.startOver = false;
    this.dialogRef.close(this.data);
  }
}
