import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { debounceTime, fromEvent, Observable, Subscription } from 'rxjs';

import { environment } from 'src/environments/environment';

import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { TextureManagerService } from '../../services/texture/texture-manager.service';
import { TextManagerService } from '../../services/text/text-manager.service';
import { GameEngineService } from '../../services/game-engine.service';
import { NotifyService } from 'src/app/shared/services/notify.service';
import { DialogNotifyService } from '../dialogs/dialog-notify.service';

import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { IntroDialogComponent } from '../dialogs/intro-dialog/intro-dialog.component';
import { LevelDialogComponent } from '../dialogs/level-dialog/level-dialog.component';
import { GameOverDialogComponent } from '../dialogs/game-over-dialog/game-over-dialog.component';

import { GameOverData } from '../dialogs/game-over-dialog/game-over-data';
import { LevelMaterialType } from '../../models/level-material-type';
import { GAME_TITLE } from 'src/app/app-constants';

@Component({
  selector: 'wgl-game-container',
  templateUrl: './game-container.component.html',
  styleUrls: ['./game-container.component.scss'],
})
export class GameContainerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas')
  gameCanvas!: ElementRef<HTMLCanvasElement>;

  private resize$: Observable<Event>;
  private resizeSubscription: Subscription;

  private _showWelcome: boolean = true;

  private _dialogRefLevel!: MatDialogRef<LevelDialogComponent>;
  private _dialogRefIntro!: MatDialogRef<IntroDialogComponent>;
  private _dialogGameOverRef!: MatDialogRef<GameOverDialogComponent>;

  private _isGameOver: boolean = false;

  ShowScoreProgress: boolean = false;
  LevelLabelColor!: string;

  public GridTemplateColumns: string = '';
  public GridTemplateRows: string = '';

  gameTitle = GAME_TITLE;

  constructor(
    private dialog: MatDialog,
    private sceneManager: SceneManagerService,
    private objectManager: ObjectManagerService,
    private textureManager: TextureManagerService,
    private textManager: TextManagerService,
    private notify: NotifyService,
    private dialogNotify: DialogNotifyService,
    private gameEngine: GameEngineService,
    public scoringManager: ScoringManagerService,
    @Inject(DOCUMENT) private document: Document
  ) {
    // set up window resizing event
    this.resize$ = fromEvent(window, 'resize');
    this.resizeSubscription = this.resize$.pipe(debounceTime(10)).subscribe(() => {
      this.sceneManager.UpdateSize(this.document.defaultView?.devicePixelRatio || 1);
    });

    // level completed
    this.objectManager.LevelCompleted.subscribe((gameOver) => {
      this.scoringManager.IncLevel();
      this._isGameOver = gameOver;
      this.initTextures();
    });
  }

  ngOnInit(): void {
    // texture load started
    this.textureManager.LevelTextureLoadingStarted.subscribe(() => {
      if (this._isGameOver) {
        this._dialogGameOverRef = this.dialog.open(GameOverDialogComponent, this.dialogConfig());
        this._dialogGameOverRef.afterClosed().subscribe((data: GameOverData) => {
          if (data.startOver) {
            this.scoringManager.RestartGame();
          } else {
            // reset stats will take care of move count based on level
            this.scoringManager.ResetStats(!data.startOver);
          }
          this.gameEngine.UpdatePlayableTextureCount(this.scoringManager.Level);
          this.updateDifficultyColor();
          this.objectManager.InitShapes(this.gameEngine.PlayableTextureCount);
        });
      } else {
        if (this._showWelcome) {
          this._dialogRefIntro = this.dialog.open(IntroDialogComponent, this.dialogConfig());
          this._dialogRefIntro.afterClosed().subscribe(() => {
            this.handleLevelDialogCLosed();
          });
        } else {
          this._dialogRefLevel = this.dialog.open(LevelDialogComponent, this.dialogConfig('30%'));
          this._dialogRefLevel.backdropClick().subscribe(() => {
            this.dialogNotify.Notify();
          });
          this._dialogRefLevel.afterClosed().subscribe(() => {
            this.handleLevelDialogCLosed();
          });
        }
      }
    });

    // start loading next level texture(s)
    this.initTextures();

    // start loading fonts
    this.textManager.InitFonts();
  }

  ngAfterViewInit(): void {
    this.sceneManager.InitScene(this.gameCanvas.nativeElement);
    this.sceneManager.UpdateSize(this.document.defaultView?.devicePixelRatio || 1);

    this.objectManager.InitStarField();
  }

  ngOnDestroy(): void {
    this.resizeSubscription.unsubscribe();
  }

  public aboutClick(): void {
    this.notify.Notify();
  }

  private initTextures(): void {
    // game difficulty level (change in number of textures used)
    this.gameEngine.UpdatePlayableTextureCount(this.scoringManager.Level);
    this.updateDifficultyColor();

    // select next level type
    const levelType = Math.floor(Math.random() * 3) + 1;
    this.textureManager.InitLevelTextures(levelType, this.gameEngine.PlayableTextureCount);
    if (!environment.production) {
      console.info('Level Type: ', LevelMaterialType[levelType]);
    }
  }

  private dialogConfig(height: string = ``): MatDialogConfig {
    let config = {
      minWidth: '20em',
      disableClose: true,
      data: {
        stats: this.scoringManager.LevelStats,
        level: this.scoringManager.Level,
      },
    };

    if (height) {
      config = Object.assign({ height }, config);
    }

    return config;
  }

  private handleLevelDialogCLosed(): void {
    if (this._showWelcome) {
      this._showWelcome = false;
      this.ShowScoreProgress = true;
      this.objectManager.InitShapes(this.gameEngine.PlayableTextureCount);
    } else {
      this.scoringManager.NextLevel();
      this.objectManager.InitShapes(this.gameEngine.PlayableTextureCount);
    }
  }

  private updateDifficultyColor(): void {
    // visual indicator for difficulty level
    this.LevelLabelColor = `#${this.gameEngine.PlayableTextureCountColor.toString(16)}`;
    this.objectManager.UpdateStarFieldColor(this.gameEngine.PlayableTextureCountColor);
  }
}
