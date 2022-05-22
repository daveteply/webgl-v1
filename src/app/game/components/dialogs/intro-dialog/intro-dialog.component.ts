import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GAME_TITLE } from 'src/app/app-constants';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { TutorialDialogComponent } from '../tutorial-dialog/tutorial-dialog.component';

@Component({
  selector: 'wgl-intro-dialog',
  templateUrl: './intro-dialog.component.html',
  styleUrls: ['./intro-dialog.component.scss'],
})
export class IntroDialogComponent {
  gameTitle = GAME_TITLE;
  texturesStillLoading: boolean = true;
  progress: number = 100;

  constructor(
    private textureManager: TextureManagerService,
    private audioManager: AudioManagerService,
    private dialog: MatDialog
  ) {
    this.textureManager.LevelTexturesLoaded.subscribe(() => {
      this.texturesStillLoading = false;
    });
    this.textureManager.LevelTextureLoadProgress.subscribe((progress) => {
      this.progress = progress;
    });

    // start-up music
    this.audioManager.PlayLevelComplete();
  }

  openTutorialDialog(): void {
    this.dialog.open(TutorialDialogComponent);
  }
}
