import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MINIMUM_MATCH_COUNT } from 'src/app/game/game-constants';
import { LevelMaterialType } from 'src/app/game/models/level-material-type';
import { TextureManagerService } from 'src/app/game/services/texture-manager.service';

@Component({
  selector: 'wgl-level-dialog',
  templateUrl: './level-dialog.component.html',
  styleUrls: ['./level-dialog.component.scss'],
})
export class LevelDialogComponent implements OnInit {
  matchTarget = MINIMUM_MATCH_COUNT;
  ctaDisabled: boolean = true;
  progress: number = 0;

  levelMaterialType = LevelMaterialType;

  constructor(
    private textureManager: TextureManagerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.textureManager.LevelType === LevelMaterialType.ColorOnly) {
      this.ctaDisabled = false;
      this.progress = 100;
    }
    this.textureManager.LevelTexturesLoaded.subscribe(() => {
      this.ctaDisabled = false;
    });
    this.textureManager.LevelTextureLoadProgress.subscribe((progress) => {
      this.progress = progress;
    });
  }
}
