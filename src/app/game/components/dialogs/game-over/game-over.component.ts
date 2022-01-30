import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
import { GameOverData } from './game-over-data';

@Component({
  selector: 'wgl-game-over',
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.scss'],
})
export class GameOverComponent {
  ctaDisabled: boolean = true;
  progress: number = 100;

  constructor(
    private textureManager: TextureManagerService,
    private dialogRef: MatDialogRef<GameOverComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GameOverData
  ) {
    this.textureManager.LevelTexturesLoaded.subscribe(() => {
      this.ctaDisabled = false;
    });
    this.textureManager.LevelTextureLoadProgress.subscribe((progress) => {
      this.progress = progress;
    });
  }

  onCloseGameOver(): void {
    this.data.restartLevel = false;
    this.data.startOver = true;
    this.dialogRef.close(this.data);
  }

  onCloseRestartLevel(): void {
    this.data.restartLevel = true;
    this.data.startOver = false;
    this.dialogRef.close(this.data);
  }
}
