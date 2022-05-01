import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GAME_TITLE, MINIMUM_MATCH_COUNT } from 'src/app/game/game-constants';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
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

  constructor(private textureManager: TextureManagerService, @Inject(MAT_DIALOG_DATA) public data: LevelDialogData) {
    this.buildAnimations(data);

    this.textureManager.LevelTexturesLoaded.subscribe(() => {
      this.texturesStillLoading = false;
    });
    this.textureManager.LevelTextureLoadProgress.subscribe((progress) => {
      this.progress = progress;
    });
  }

  private buildAnimations(levelData: LevelDialogData): void {
    // round ms
    if (levelData.stats.fastestMatchMs) {
      // https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
      levelData.stats.fastestMatchMs = Math.round((levelData.stats.fastestMatchMs / 1000) * 100) / 100;
    }

    // iterate all keys
    Object.entries(levelData.stats).forEach((entry) => {
      const [key, value] = entry;
      console.log(key, value);
    });
  }
}
