import { Component, NgZone, OnInit } from '@angular/core';

import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { TextureManagerService } from '../../services/texture/texture-manager.service';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LevelDialogComponent } from '../dialogs/level-dialog/level-dialog.component';
import { GameOverComponent } from '../dialogs/game-over/game-over.component';
import { GameOverData } from '../dialogs/game-over/game-over-data';

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

  private _isGameOver: boolean = false;

  constructor(
    private ngZone: NgZone,
    private dialog: MatDialog,
    private sceneManager: SceneManagerService,
    private objectManager: ObjectManagerService,
    private textureManager: TextureManagerService,
    public scoringManager: ScoringManagerService
  ) {}

  ngOnInit(): void {
    this.objectManager.LevelCompleted.subscribe((gameOver) => {
      this._isGameOver = gameOver;
      this.textureManager.InitLevelTextures(MathUtils.randInt(1, 3));
    });

    this.textureManager.LevelTextureLoadingStarted.subscribe(() => {
      if (this._isGameOver) {
        this._dialogGameOverRef = this.dialog.open(GameOverComponent, {
          maxWidth: '25em',
          disableClose: true,
          data: {
            level: this.scoringManager.Level,
          },
        });
        this._dialogGameOverRef
          .afterClosed()
          .subscribe((data: GameOverData) => {
            if (data.startOver) {
              this.scoringManager.RestartGame();
            } else {
              // reset stats will take care of move count based on level
              this.scoringManager.ResetStats(data.restartLevel);
            }
            this.objectManager.InitShapes();
          });
      } else {
        this._dialogRef = this.dialog.open(
          LevelDialogComponent,
          this.diagConfig()
        );
        this._dialogRef.afterClosed().subscribe(() => {
          this.handleLevelDialogCLosed();
        });
      }
    });

    // start loading next level texture(s)
    this.textureManager.InitLevelTextures(MathUtils.randInt(1, 3));
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

  private handleLevelDialogCLosed(): void {
    if (this._showWelcome) {
      // set up scene (if needed) and animate
      this.sceneManager.InitScene();
      this.animate();
      this._showWelcome = false;
    } else {
      this.scoringManager.NextLevel();
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
