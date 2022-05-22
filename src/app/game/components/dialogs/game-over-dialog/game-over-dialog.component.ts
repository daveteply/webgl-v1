import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
import { GameOverData } from './game-over-data';

@Component({
  selector: 'wgl-game-over-dialog',
  templateUrl: './game-over-dialog.component.html',
  styleUrls: ['./game-over-dialog.component.scss'],
})
export class GameOverDialogComponent {
  texturesStillLoading: boolean = true;
  progress: number = 100;

  isLevelOne: boolean;

  constructor(
    private textureManager: TextureManagerService,
    private dialogRef: MatDialogRef<GameOverDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GameOverData
  ) {
    this.textureManager.LevelTexturesLoaded.subscribe(() => {
      this.texturesStillLoading = false;
    });
    this.textureManager.LevelTextureLoadProgress.subscribe((progress) => {
      this.progress = progress;
    });

    this.isLevelOne = data.level === 1;
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
