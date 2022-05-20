import { Component } from '@angular/core';
import { GAME_TITLE } from 'src/app/app-constants';
import { MINIMUM_MATCH_COUNT } from 'src/app/game/game-constants';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';

@Component({
  selector: 'wgl-intro-dialog',
  templateUrl: './intro-dialog.component.html',
  styleUrls: ['./intro-dialog.component.scss'],
})
export class IntroDialogComponent {
  gameTitle = GAME_TITLE;
  matchTarget = MINIMUM_MATCH_COUNT;

  texturesStillLoading: boolean = true;
  progress: number = 100;

  constructor(private textureManager: TextureManagerService, private audioManager: AudioManagerService) {
    this.textureManager.LevelTexturesLoaded.subscribe(() => {
      this.texturesStillLoading = false;
    });
    this.textureManager.LevelTextureLoadProgress.subscribe((progress) => {
      this.progress = progress;
    });

    // start-up music
    this.audioManager.PlayLevelComplete();
  }
}
