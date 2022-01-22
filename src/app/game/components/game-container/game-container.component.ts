import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MathUtils } from 'three';
import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { TextureManagerService } from '../../services/texture-manager.service';
import { LevelDialogComponent } from '../dialogs/level-dialog/level-dialog.component';
import * as TWEEN from '@tweenjs/tween.js';
import { AudioManagerService } from '../../services/audio-manager.service';

@Component({
  selector: 'wgl-game-container',
  templateUrl: './game-container.component.html',
  styleUrls: ['./game-container.component.scss'],
})
export class GameContainerComponent implements OnInit {
  constructor(
    private ngZone: NgZone,
    private dialog: MatDialog,
    private sceneManager: SceneManagerService,
    private objectManager: ObjectManagerService,
    private textureManager: TextureManagerService,
    private audioManager: AudioManagerService,
    public scoringManager: ScoringManagerService
  ) {}

  ngOnInit(): void {
    const materialType = this.preloadTextures();

    let welcomeDialog = this.dialog.open(LevelDialogComponent, {
      maxWidth: '25em',
      disableClose: true,
      data: {
        score: this.scoringManager.Score,
        stats: this.scoringManager.LevelStats,
        materialType: materialType,
      },
    });

    // level start event
    welcomeDialog.afterClosed().subscribe(() => {
      // set up scene and animate
      this.sceneManager.InitScene();
      this.animate();
    });

    // level complete
    this.objectManager.LevelCompleted.subscribe(() => {
      const materialType = this.preloadTextures();
      const levelDialog = this.dialog.open(LevelDialogComponent, {
        maxWidth: '25em',
        disableClose: true,
        data: {
          score: this.scoringManager.Score,
          stats: this.scoringManager.LevelStats,
          materialType: materialType,
        },
      });
      levelDialog.afterClosed().subscribe(() => {
        this.scoringManager.NextLevel();
        this.objectManager.InitShapes();
      });
    });
  }

  private preloadTextures(): number {
    const textureType = MathUtils.randInt(1, 3);
    this.textureManager.InitLevelTextures(textureType);
    return textureType;
  }

  private animate(): void {
    TWEEN.update();
    this.ngZone.runOutsideAngular(() => {
      this.sceneManager.RenderScene();
    });

    requestAnimationFrame(() => {
      this.animate();
    });
  }
}
