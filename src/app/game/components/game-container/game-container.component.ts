import { Component, OnInit } from '@angular/core';

import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { TextureManagerService } from '../../services/texture/texture-manager.service';
import { LayoutManagerService } from 'src/app/shared/services/layout-manager.service';
import { TextManagerService } from '../../services/text/text-manager.service';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LevelDialogComponent } from '../dialogs/level-dialog/level-dialog.component';
import { GameOverComponent } from '../dialogs/game-over/game-over.component';
import { GameOverData } from '../dialogs/game-over/game-over-data';
import { environment } from 'src/environments/environment';
import { LevelMaterialType } from '../../models/level-material-type';

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

  ShowScoreProgress: boolean = false;

  public GridTemplateColumns: string = '';
  public GridTemplateRows: string = '';

  constructor(
    private dialog: MatDialog,
    private sceneManager: SceneManagerService,
    private objectManager: ObjectManagerService,
    private textureManager: TextureManagerService,
    private layoutManager: LayoutManagerService,
    private textManager: TextManagerService,
    public scoringManager: ScoringManagerService
  ) {}

  ngOnInit(): void {
    this.sceneManager.InitScene();
    this.objectManager.InitStarField();

    // level completed
    this.objectManager.LevelCompleted.subscribe((gameOver) => {
      this._isGameOver = gameOver;
      this.initTextures();
    });

    // texture load started
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
              this.scoringManager.ResetStats(!data.startOver);
            }
            this.objectManager.InitShapes();
          });
      } else {
        this._dialogRef = this.dialog.open(
          LevelDialogComponent,
          this.dialogConfig()
        );
        this._dialogRef.afterClosed().subscribe(() => {
          this.handleLevelDialogCLosed();
        });
      }
    });

    // resize event
    this.layoutManager.OnResize.subscribe(() => {
      this.GridTemplateColumns = this.layoutManager.GridTemplateColumns;
      this.GridTemplateRows = this.layoutManager.GridTemplateRows;
    });

    // initial size
    this.GridTemplateColumns = this.layoutManager.GridTemplateColumns;
    this.GridTemplateRows = this.layoutManager.GridTemplateRows;

    // start loading next level texture(s)
    this.initTextures();

    // start loading fonts
    this.textManager.InitFonts();
  }

  private initTextures(): void {
    const levelType = Math.floor(Math.random() * 3) + 1;
    this.textureManager.InitLevelTextures(levelType);
    if (!environment.production) {
      console.info('Level Type: ', LevelMaterialType[levelType]);
    }
  }

  private dialogConfig(restartLevel: boolean = false): any {
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
      this._showWelcome = false;
      this.ShowScoreProgress = true;
      this.objectManager.InitShapes();
    } else {
      this.scoringManager.NextLevel();
      this.objectManager.InitShapes();
    }
  }
}
