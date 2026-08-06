import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, fromEvent, Observable, take } from 'rxjs';

import { ObjectManagerService } from '../../services/object-manager';
import { SceneManagerService } from '../../services/scene-manager';
import { ScoringManagerService } from '../../services/scoring-manager';
import { TextureManagerService } from '../../services/texture/texture-manager';
import { TextManagerService } from '../../text/services/text-manager';
import { GameEngineService } from '../../services/game-engine';
import { DialogNotifyService } from '../dialogs/services/dialog-notify';
import { HighScoreManagerService } from '../../../shared/services/high-score-manager';
import { HintsManagerService } from '../../services/hints-manager';
import { PostProcessingManagerService } from '../../services/post-processing-manager';
import { SaveGameService } from '../../services/save-game/save-game';
import { ShareManagerService } from '../../services/share-manager';

import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Intro } from '../dialogs/components/intro/intro';
import { LevelComplete } from '../dialogs/components/level-complete/level-complete';
import { GameOver } from '../dialogs/components/game-over/game-over';
import { HowToPlay } from '../dialogs/components/how-to-play/how-to-play';
import { MovesRemaining } from '../dialogs/components/moves-remaining/moves-remaining';
import { TextZoom } from '../../text/components/text-zoom/text-zoom';
import { MovesLeft } from '../moves-left/moves-left';
import { ShareContentComponent } from '../share-content/share-content';
import { GameMenu } from '../game-menu/game-menu';
import { ProgressBar } from '../../../shared/components/progress-bar/progress-bar';

import { GameOverData } from '../dialogs/components/game-over/game-over-data';
import {
  STORAGE_HINT_HOW_TO_PLAY,
  STORAGE_HINT_MOVES_DECREASE,
  STORAGE_HINT_MOVES_INCREASE,
} from '../../game-constants';

@Component({
  selector: 'wgl-game-container',
  providers: [DecimalPipe],
  imports: [CommonModule, MatProgressBarModule, TextZoom, MovesLeft, ShareContentComponent, GameMenu, ProgressBar],
  templateUrl: './game-container.html',
  styleUrl: './game-container.scss',
})
export class GameContainer implements OnInit, AfterViewInit {
  @ViewChild('gameCanvas')
  gameCanvas!: ElementRef<HTMLCanvasElement>;

  // Dependency Injections
  private dialog = inject(MatDialog);
  private sceneManager = inject(SceneManagerService);
  private objectManager = inject(ObjectManagerService);
  private textureManager = inject(TextureManagerService);
  private textManager = inject(TextManagerService);
  private dialogNotify = inject(DialogNotifyService);
  private gameEngine = inject(GameEngineService);
  private highScoreManager = inject(HighScoreManagerService);
  private hintsManager = inject(HintsManagerService);
  private postProcessingManager = inject(PostProcessingManagerService);
  private saveGame = inject(SaveGameService);
  private shareManager = inject(ShareManagerService);
  public scoringManager = inject(ScoringManagerService);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  private resize$: Observable<Event> = fromEvent(window, 'resize');

  private _showWelcome = true;

  private _dialogRefLevel!: MatDialogRef<LevelComplete>;
  private _dialogRefIntro!: MatDialogRef<Intro>;
  private _dialogGameOverRef!: MatDialogRef<GameOver>;

  private _isGameOver = false;

  showScoreProgress = signal<boolean>(false);
  LevelLabelColor!: string;

  public GridTemplateColumns = '';
  public GridTemplateRows = '';

  copyrightYear = new Date().getFullYear();

  constructor() {
    // set up window resizing event with automatic cleanup
    this.resize$.pipe(debounceTime(10), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.sceneManager.UpdateSize(this.document.defaultView?.devicePixelRatio || 1);
    });
  }

  ngOnInit(): void {
    // level completed
    this.objectManager.LevelCompleted.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((gameOver) => {
      // hide share
      this.shareManager.UpdateInLevel(false);

      // game state
      this._isGameOver = gameOver;
      if (!this._isGameOver) {
        this.scoringManager.IncLevel();
      } else {
        this.highScoreManager.UpdateHighScores(this.scoringManager.Score);
      }

      // clear highlighted pieces
      this.postProcessingManager.UpdateOutlinePassObjects([]);

      // initiate texture load for next level
      this.initTextures();
    });

    // texture load started
    this.textureManager.LevelTextureLoadingStarted.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (isRestoring) => {
        if (!isRestoring) {
          // level transition
          this.gameEngine.InitLevelTransitionType();

          if (this._isGameOver) {
            // game over
            this._dialogGameOverRef = this.dialog.open(GameOver, this.dialogConfig());
            this._dialogGameOverRef.afterClosed().subscribe((data: GameOverData) => {
              this.shareManager.UpdateInLevel(true);
              if (data.startOver) {
                this.scoringManager.RestartGame();
              } else {
                // reset stats will take care of move count based on level
                this.scoringManager.ResetStats(!data.startOver);
              }
              this.gameEngine.UpdatePlayableTextureCount(this.scoringManager.Level);
              this.updateDifficultyColor();
              this.objectManager.NextLevel(this.scoringManager.Level, true);
            });
          } else {
            if (this._showWelcome) {
              // intro
              this._dialogRefIntro = this.dialog.open(Intro, this.dialogConfig());
              this._dialogRefIntro.afterClosed().subscribe((result) => {
                // restore game
                if (result?.isRestoring) {
                  this.initTextures();
                  this.scoringManager.Restore(this.saveGame.SavedGameData.scoring);
                } else {
                  this.handleLevelDialogCLosed();
                }
              });
            } else {
              // level complete
              const height = `${this.scoringManager.StatsEntries() * 3.5 + 8}em`;
              this._dialogRefLevel = this.dialog.open(LevelComplete, this.dialogConfig(height));
              this._dialogRefLevel.backdropClick().subscribe(() => {
                this.dialogNotify.Notify();
              });
              this._dialogRefLevel.afterClosed().subscribe(() => {
                this.handleLevelDialogCLosed();
              });
            }
          }
        }
      },
    );

    // update level materials for start of game
    this.textureManager.LevelTexturesLoaded.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((loaded) => {
      if (loaded) {
        this.objectManager.UpdateLevelMaterials(this.scoringManager.Level);
      }
    });

    // textures restored (only emits while restoring)
    this.textureManager.LevelTexturesRestoredLoaded.pipe(take(1)).subscribe(() => {
      this.objectManager.UpdateLevelMaterials(this.scoringManager.Level);
      this.handleLevelDialogCLosed();
    });

    // show the tutorial after the initial level loads
    this.objectManager.LevelChangeAnimationComplete.pipe(take(1)).subscribe(() => {
      this.hintsManager.GetHintViewed(STORAGE_HINT_HOW_TO_PLAY).then((result) => {
        if (result.value !== 'true') {
          const howToPlay = this.dialog.open(HowToPlay);
          howToPlay.afterClosed().subscribe(() => {
            this.hintsManager.SetHintViewed(STORAGE_HINT_HOW_TO_PLAY);
          });
        }
      });
    });

    // show tutorial for move changes
    this.scoringManager.MovesChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((increase) => {
      if (increase) {
        this.hintsManager.GetHintViewed(STORAGE_HINT_MOVES_INCREASE).then((result) => {
          if (!result.value) {
            const dialog = this.dialog.open(MovesRemaining, {
              position: { top: '3.5em' },
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
            const dialog = this.dialog.open(MovesRemaining, {
              position: { top: '3.5em' },
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

    // start loading fonts for splash text
    this.textManager.InitFonts();
  }

  ngAfterViewInit(): void {
    this.sceneManager.InitScene(this.gameCanvas.nativeElement);
    this.sceneManager.UpdateSize(this.document.defaultView?.devicePixelRatio || 1);

    this.objectManager.InitStarField();
  }

  private initTextures(): void {
    // game difficulty level (change in number of textures used)
    let targetLevel = this.scoringManager.Level;
    if (this.saveGame.IsRestoring) {
      targetLevel = this.saveGame.SavedGameData.scoring?.level || 1;
    }
    this.gameEngine.UpdatePlayableTextureCount(targetLevel);
    this.updateDifficultyColor();

    // decide level materials and geometries
    if (this.saveGame.IsRestoring) {
      this.gameEngine.RestoreLevelTypes(
        this.saveGame.SavedGameData.levelMaterialType || 1,
        this.saveGame.SavedGameData.levelGeometryType || 0,
      );
    } else {
      this.gameEngine.InitLevelTypes(this.scoringManager.Level);
    }

    // select next level material type
    this.textureManager.InitLevelTextures(
      this.gameEngine.PlayableTextureCount,
      this.gameEngine.LevelMaterialType,
      this.gameEngine.LevelGeometryType,
    );
  }

  private dialogConfig(height = ``): MatDialogConfig {
    let config = {
      minWidth: '20em',
      disableClose: true,
      panelClass: ['wgl-pane-bounce'],
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
    // show share
    this.shareManager.UpdateInLevel(true);

    // dismiss dialog and launch next level
    if (this._showWelcome) {
      this._showWelcome = false;
      this.showScoreProgress.set(true);
      this.objectManager.NextLevel(this.scoringManager.Level);
    } else {
      this.scoringManager.NextLevel();
      this.objectManager.NextLevel(this.scoringManager.Level, true);
    }
  }

  private updateDifficultyColor(): void {
    // visual indicator for difficulty level
    this.LevelLabelColor = `#${this.gameEngine.PlayableTextureCountColor.toString(16)}`;
    this.objectManager.UpdateStarFieldColor(this.gameEngine.PlayableTextureCountColor);
  }
}

export { GameContainer as GameContainerComponent };
