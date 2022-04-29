import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GAME_TITLE, MINIMUM_MATCH_COUNT } from 'src/app/game/game-constants';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { LevelDialogData } from './level-dialog-data';

@Component({
  selector: 'wgl-level-dialog',
  templateUrl: './level-dialog.component.html',
  styleUrls: ['./level-dialog.component.scss'],
})
export class LevelDialogComponent {
  matchTarget = MINIMUM_MATCH_COUNT;
  texturesStillLoading: boolean = true;
  progress: number = 100;

  gameTitle = GAME_TITLE;

  constructor(
    private textureManager: TextureManagerService,
    private audioManager: AudioManagerService,
    @Inject(MAT_DIALOG_DATA) public data: LevelDialogData
  ) {
    this.textureManager.LevelTexturesLoaded.subscribe(() => {
      this.texturesStillLoading = false;
    });
    this.textureManager.LevelTextureLoadProgress.subscribe((progress) => {
      this.progress = progress;
    });

    // start up music
    if (data.isWelcome) {
      this.audioManager.PlayLevelComplete();
    }
  }
}
