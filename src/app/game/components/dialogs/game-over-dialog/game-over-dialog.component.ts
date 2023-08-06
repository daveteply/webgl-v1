import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Subject, takeUntil } from 'rxjs';

import { GAME_OVER_EMOJI } from 'src/app/game/game-constants';
import { GameOverData } from './game-over-data';

import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
import { MathUtils } from 'three';
import { HighScoresComponent } from '../../high-scores/high-scores.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'wgl-game-over-dialog',
  standalone: true,
  templateUrl: './game-over-dialog.component.html',
  styleUrls: ['./game-over-dialog.component.scss'],
  imports: [CommonModule, MatDialogModule, MatButtonModule, HighScoresComponent, ProgressBarComponent],
})
export class GameOverDialogComponent implements OnDestroy {
  texturesStillLoading = true;
  progress = 100;

  isLevelOne: boolean;
  gameOverEmoji = String.fromCodePoint(GAME_OVER_EMOJI[MathUtils.randInt(0, GAME_OVER_EMOJI.length - 1)]);

  private notifier = new Subject();

  constructor(
    private textureManager: TextureManagerService,
    private dialogRef: MatDialogRef<GameOverDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GameOverData
  ) {
    this.textureManager.LevelTexturesLoaded.pipe(takeUntil(this.notifier)).subscribe(() => {
      this.texturesStillLoading = false;
    });
    this.textureManager.LevelTextureLoadProgress.subscribe((progress) => {
      this.progress = progress;
    });

    this.isLevelOne = data.level === 1;
  }

  ngOnDestroy(): void {
    this.notifier.next(undefined);
    this.notifier.complete();
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
