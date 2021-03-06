import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { debounceTime, fromEvent, Observable, Subject, Subscription, takeUntil, take } from 'rxjs';

import { environment } from 'src/environments/environment';

import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { TextureManagerService } from '../../services/texture/texture-manager.service';
import { TextManagerService } from '../../services/text/text-manager.service';
import { GameEngineService } from '../../services/game-engine.service';
import { NotifyService } from 'src/app/shared/services/notify.service';
import { DialogNotifyService } from '../dialogs/dialog-notify.service';
import { HighScoreManagerService } from 'src/app/shared/services/high-score-manager.service';
import { HintsManagerService } from '../../services/hints-manager.service';

import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { IntroDialogComponent } from '../dialogs/intro-dialog/intro-dialog.component';
import { LevelDialogComponent } from '../dialogs/level-dialog/level-dialog.component';
import { GameOverDialogComponent } from '../dialogs/game-over-dialog/game-over-dialog.component';
import { HowToPlayComponent } from '../dialogs/hints/how-to-play/how-to-play.component';
import { MovesRemainingInfoComponent } from '../dialogs/hints/moves-remaining-info/moves-remaining-info.component';

import { GameOverData } from '../dialogs/game-over-dialog/game-over-data';
import { AdmobManagerService } from 'src/app/shared/services/admob-manager.service';
import {
  LEVEL_TO_START_ADS,
  STORAGE_HINT_HOW_TO_PLAY,
  STORAGE_HINT_MOVES_DECREASE,
  STORAGE_HINT_MOVES_INCREASE,
} from '../../game-constants';

@Component({
  selector: 'wgl-game-container',
  templateUrl: './game-container.component.html',
  styleUrls: ['./game-container.component.scss'],
})
export class GameContainerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas')
  gameCanvas!: ElementRef<HTMLCanvasElement>;

  private notifier = new Subject();

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

  constructor(
    private dialog: MatDialog,
    private sceneManager: SceneManagerService,
    private objectManager: ObjectManagerService,
    private textureManager: TextureManagerService,
    private textManager: TextManagerService,
    private notify: NotifyService,
    private dialogNotify: DialogNotifyService,
    private gameEngine: GameEngineService,
    private admob: AdmobManagerService,
    private highScoreManager: HighScoreManagerService,
    private hintsManager: HintsManagerService,
    public scoringManager: ScoringManagerService,
    @Inject(DOCUMENT) private document: Document
  ) {
    // set up window resizing event
    this.resize$ = fromEvent(window, 'resize');
    this.resizeSubscription = this.resize$
      .pipe(debounceTime(10))
      .pipe(takeUntil(this.notifier))
      .subscribe(() => {
        this.sceneManager.UpdateSize(this.document.defaultView?.devicePixelRatio || 1);
      });
  }

  ngOnInit(): void {
    // level completed
    this.objectManager.LevelCompleted.pipe(takeUntil(this.notifier)).subscribe((gameOver) => {
      this._isGameOver = gameOver;
      if (!this._isGameOver) {
        this.scoringManager.IncLevel();
      } else {
        this.highScoreManager.UpdateHighScores(this.scoringManager.Score);
      }

      // ads
      if (this.scoringManager.Level > LEVEL_TO_START_ADS) {
        this.admob.ShowBanner();
      }

      this.initTextures();
    });

    // texture load started
    this.textureManager.LevelTextureLoadingStarted.pipe(takeUntil(this.notifier)).subscribe(() => {
      if (this._isGameOver) {
        // game over
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
          this.objectManager.NextLevel();
        });
      } else {
        if (this._showWelcome) {
          // intro
          this._dialogRefIntro = this.dialog.open(IntroDialogComponent, this.dialogConfig());
          this._dialogRefIntro.afterClosed().subscribe(() => {
            this.handleLevelDialogCLosed();
          });
        } else {
          // level complete
          const height = `${this.scoringManager.StatsEntries() * 2.2 + 8}rem`;
          this._dialogRefLevel = this.dialog.open(LevelDialogComponent, this.dialogConfig(height));
          this._dialogRefLevel.backdropClick().subscribe(() => {
            this.dialogNotify.Notify();
          });
          this._dialogRefLevel.afterClosed().subscribe(() => {
            this.handleLevelDialogCLosed();
          });
        }
      }
    });

    // update level materials for start of game
    this.textureManager.LevelTexturesLoaded.pipe(take(1)).subscribe(() => {
      this.objectManager.UpdateLevelMaterials();
    });

    // show the tutorial after the initial level loads
    this.objectManager.LevelChangeAnimationComplete.pipe(take(1)).subscribe(() => {
      this.hintsManager.GetHintViewed(STORAGE_HINT_HOW_TO_PLAY).then((result) => {
        if (result.value !== 'true') {
          const howToPlay = this.dialog.open(HowToPlayComponent, { panelClass: 'cdk-overlay-pane__show' });
          howToPlay.afterClosed().subscribe(() => {
            this.hintsManager.SetHintViewed(STORAGE_HINT_HOW_TO_PLAY);
          });
        }
      });
    });

    // show tutorial for move changes
    this.scoringManager.MovesChange.pipe(takeUntil(this.notifier)).subscribe((increase) => {
      if (increase) {
        this.hintsManager.GetHintViewed(STORAGE_HINT_MOVES_INCREASE).then((result) => {
          if (!result.value) {
            const dialog = this.dialog.open(MovesRemainingInfoComponent, {
              panelClass: 'cdk-overlay-pane__show',
              position: { top: '5em' },
              data: true,
            });
            dialog.afterClosed().subscribe(() => {
              this.hintsManager.SetHintViewed(STORAGE_HINT_MOVES_INCREASE);
            });
          }
        });
      } else {
        this.hintsManager.GetHintViewed(STORAGE_HINT_MOVES_DECREASE).then((result) => {
          if (!result.value) {
            const dialog = this.dialog.open(MovesRemainingInfoComponent, {
              panelClass: 'cdk-overlay-pane__show',
              position: { top: '5em' },
              data: false,
            });
            dialog.afterClosed().subscribe(() => {
              this.hintsManager.SetHintViewed(STORAGE_HINT_MOVES_DECREASE);
            });
          }
        });
      }
    });

    // initialize objects and materials
    this.objectManager
      .InitShapes()
      .pipe(take(1))
      .subscribe(() => {
        // start loading initial level texture(s)
        this.initTextures();
      });

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
    this.notifier.next(undefined);
    this.notifier.complete();
  }

  public aboutClick(): void {
    this.notify.Notify();
  }

  private initTextures(): void {
    // game difficulty level (change in number of textures used)
    this.gameEngine.UpdatePlayableTextureCount(this.scoringManager.Level);
    this.updateDifficultyColor();

    // decide level materials and geometries
    this.gameEngine.InitLevelTypes();

    // select next level material type
    this.textureManager.InitLevelTextures(
      this.gameEngine.PlayableTextureCount,
      this.gameEngine.LevelMaterialType,
      this.gameEngine.LevelGeometryType
    );
  }

  private dialogConfig(height: string = ``): MatDialogConfig {
    let config = {
      minWidth: '20em',
      disableClose: true,
      panelClass: ['wgl-pane-bounce', 'cdk-overlay-pane__show'],
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
    this.admob.RemoveBanner();
    if (this._showWelcome) {
      this._showWelcome = false;
      this.ShowScoreProgress = true;
      this.objectManager.NextLevel(false);
    } else {
      this.scoringManager.NextLevel();
      this.objectManager.NextLevel();
    }
  }

  private updateDifficultyColor(): void {
    // visual indicator for difficulty level
    this.LevelLabelColor = `#${this.gameEngine.PlayableTextureCountColor.toString(16)}`;
    this.objectManager.UpdateStarFieldColor(this.gameEngine.PlayableTextureCountColor);
  }
}
