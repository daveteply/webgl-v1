import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
import { GameOverData } from './game-over-data';

@Component({
  selector: 'wgl-game-over',
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.scss'],
})
export class GameOverComponent implements OnInit {
  ctaDisabled: boolean = true;
  progress: number = 100;

  constructor(
    private textureManager: TextureManagerService,
    @Inject(MAT_DIALOG_DATA) public data: GameOverData
  ) {}

  ngOnInit(): void {
    this.textureManager.LevelTexturesLoaded.subscribe(() => {
      this.ctaDisabled = false;
    });
    this.textureManager.LevelTextureLoadProgress.subscribe((progress) => {
      this.progress = progress;
    });
  }
}
