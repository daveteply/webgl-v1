import { Component, NgZone, OnInit } from '@angular/core';

import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { TextureManagerService } from '../../services/texture/texture-manager.service';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LevelDialogComponent } from '../dialogs/level-dialog/level-dialog.component';
import { GameOverComponent } from '../dialogs/game-over/game-over.component';

import { MathUtils } from 'three';
import * as TWEEN from '@tweenjs/tween.js';

@Component({
  selector: 'wgl-game-container',
  templateUrl: './game-container.component.html',
  styleUrls: ['./game-container.component.scss'],
})
export class GameContainerComponent implements OnInit {
  private _dialogRef!: MatDialogRef<LevelDialogComponent>;
  private _dialogGameOverRef!: MatDialogRef<GameOverComponent>;
  private _showWelcome: boolean = true;

  constructor(
    private ngZone: NgZone,
    private dialog: MatDialog,
    private sceneManager: SceneManagerService,
    private objectManager: ObjectManagerService,
    private textureManager: TextureManagerService,
    public scoringManager: ScoringManagerService
  ) {}

  ngOnInit(): void {
    // start loading next level texture(s)
    this.textureManager.InitLevelTextures(MathUtils.randInt(1, 3));

    this._dialogRef = this.dialog.open(LevelDialogComponent, this.diagConfig());
    this._dialogRef.afterClosed().subscribe(() => {
      this.handleLevelDialogCLosed();
    });

    this.objectManager.LevelCompleted.subscribe((gameOver) => {
      // player will select restart level or restart game; going to need
      //   to load next textures regardless
      this.textureManager.InitLevelTextures(MathUtils.randInt(1, 3));

      if (gameOver) {
        // game over
        this._dialogGameOverRef = this.dialog.open(GameOverComponent, {
          maxWidth: '25em',
          disableClose: true,
          data: {
            level: this.scoringManager.Level,
          },
        });
        this._dialogGameOverRef.afterClosed().subscribe((restartLevel) => {
          // reset stats will take care of move count based on level
          this.scoringManager.ResetStats();
          this.handleLevelDialogCLosed(restartLevel);
        });
      } else {
        // dialog will show loading progress of texture(s)
        this._dialogRef = this.dialog.open(
          LevelDialogComponent,
          this.diagConfig()
        );
        this._dialogRef.afterClosed().subscribe(() => {
          this.handleLevelDialogCLosed();
        });
      }
    });
  }

  private diagConfig(restartLevel: boolean = false): any {
    return {
      maxWidth: '25em',
      disableClose: true,
      data: {
        isWelcome: this._showWelcome,
        stats: this.scoringManager.LevelStats,
        restartLevel: restartLevel,
      },
    };
  }

  private handleLevelDialogCLosed(restartLevel: boolean = false): void {
    if (this._showWelcome) {
      // set up scene and animate
      this.sceneManager.InitScene();
      this.animate();
      this._showWelcome = false;
    } else {
      if (!restartLevel) {
        this.scoringManager.NextLevel();
      }
      this.objectManager.InitShapes();
    }
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
