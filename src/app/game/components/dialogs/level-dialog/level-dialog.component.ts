import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MINIMUM_MATCH_COUNT } from 'src/app/game/game-constants';
import { ObjectManagerService } from 'src/app/game/services/object-manager.service';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
import { LevelDialogData } from './level-dialog-data';

@Component({
  selector: 'wgl-level-dialog',
  templateUrl: './level-dialog.component.html',
  styleUrls: ['./level-dialog.component.scss'],
})
export class LevelDialogComponent {
  matchTarget = MINIMUM_MATCH_COUNT;
  levelLoading: boolean = true;
  progress: number = 100;

  constructor(
    private textureManager: TextureManagerService,
    private objectManager: ObjectManagerService,
    @Inject(MAT_DIALOG_DATA) public data: LevelDialogData
  ) {
    this.objectManager.LevelInitCompleted.subscribe(() => {
      this.levelLoading = false;
    });
    this.textureManager.LevelTextureLoadProgress.subscribe((progress) => {
      this.progress = progress;
    });
  }
}
