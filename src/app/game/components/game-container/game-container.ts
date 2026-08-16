import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, filter, fromEvent, Observable, take } from 'rxjs';

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
import { PRNG } from '../../../shared/utils/prng';

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

import { GameOverData } from '../dialogs/components/game-over/game-over-type';
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
  private _pendingIntroDialog = false;

  private _dialogRefLevel!: MatDialogRef<LevelComplete>;
  private _dialogRefIntro!: MatDialogRef<Intro>;
  private _dialogGameOverRef!: MatDialogRef<GameOver>;

  private _isGameOver = false;
  private _activeLevelSeed = PRNG.generateSeed();
  private _activeRng: PRNG = new PRNG(this._activeLevelSeed);

  showScoreProgress = signal<boolean>(false);
  splashPhase = signal<'black' | 'image' | 'fade-out' | 'done'>('black');
  LevelLabelColor = signal<string>('#ffffff');

  public GridTemplateColumns = '';
  public GridTemplateRows = '';

  copyrightYear = signal<number>(new Date().getFullYear());

  constructor() {
    // set up window resizing event with automatic cleanup
    this.resize$.pipe(debounceTime(10), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.sceneManager.UpdateSize(this.document.defaultView?.devicePixelRatio || 1);
    });
  }

  ngOnInit(): void {
    // level completed
    this.objectManager.LevelCompleted.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((gameOver) => {
      // game state
      this._isGameOver = gameOver;
      if (!this._isGameOver) {
        this.scoringManager.IncLevel();
        this._activeLevelSeed = PRNG.generateSeed();
        this._activeRng = new PRNG(this._activeLevelSeed);
        this.saveGame
          .SaveState(
            this.scoringManager.Level,
            this.scoringManager.Score,
            this.scoringManager.PlayerMoves,
            this._activeLevelSeed,
          )
          .pipe(take(1))
          .subscribe();
      } else {
        this.highScoreManager.UpdateHighScores(this.scoringManager.Score);
      }

      // clear highlighted pieces
      this.postProcessingManager.UpdateOutlinePassObjects([]);

      // initiate texture load for next level
      this.initTextures();
    });

    // texture load started
    this.textureManager.LevelTextureLoadingStarted.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      // level transition
      this.gameEngine.InitLevelTransitionType(this.scoringManager.Level);

      if (this._isGameOver) {
        // game over
        this._dialogGameOverRef = this.dialog.open(GameOver, this.dialogConfig());
        this._dialogGameOverRef.afterClosed().subscribe((data: GameOverData) => {
          this.shareManager.UpdateInLevel(true);
          if (data.startOver) {
            this.saveGame.ClearSaveState();
            this.scoringManager.RestartGame();
            this._activeLevelSeed = PRNG.generateSeed();
            this._activeRng = new PRNG(this._activeLevelSeed);
          } else {
            // reset stats will take care of move count based on level
            this.scoringManager.ResetStats(!data.startOver);
            this.saveGame
              .SaveState(
                this.scoringManager.Level,
                this.scoringManager.Score,
                this.scoringManager.PlayerMoves,
                this._activeLevelSeed,
              )
              .pipe(take(1))
              .subscribe();
          }
          this.objectManager.NextLevel(this.scoringManager.Level, true, this._activeRng);
        });
      } else {
        if (this._showWelcome) {
          // intro (deferred until splash screen finishes)
          if (this.splashPhase() === 'done') {
            this.openIntroDialog();
          } else {
            this._pendingIntroDialog = true;
          }
        } else {
          // level complete
          const height = `min(${Math.max(17.5, this.scoringManager.StatsEntries() * 2.8 + 10)}em, 88dvh)`;
          this._dialogRefLevel = this.dialog.open(LevelComplete, this.dialogConfig(height));
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
    this.textureManager.LevelTexturesLoaded.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((loaded) => {
      if (loaded && this._showWelcome) {
        this.objectManager.UpdateLevelMaterials(this.scoringManager.Level, this._activeRng);
      }
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

    // initialize scoring and RNG from saved state if present
    const saved = this.saveGame.GetSaveState();
    if (saved) {
      this._activeLevelSeed = saved.seed;
      this._activeRng = new PRNG(this._activeLevelSeed);
      this.scoringManager.StartSavedGame(saved.level, saved.score, saved.moves);
    } else {
      this._activeLevelSeed = PRNG.generateSeed();
      this._activeRng = new PRNG(this._activeLevelSeed);
    }

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

    // Splash screen animation sequence: black -> RikkleBacker image -> hold -> fade out
    setTimeout(() => {
      this.splashPhase.set('image');
      setTimeout(() => {
        this.splashPhase.set('fade-out');
        setTimeout(() => {
          this.splashPhase.set('done');
          if (this._pendingIntroDialog) {
            this._pendingIntroDialog = false;
            this.openIntroDialog();
          }
        }, 1000);
      }, 2000);
    }, 150);
  }

  private openIntroDialog(): void {
    if (!this._dialogRefIntro) {
      this._dialogRefIntro = this.dialog.open(Intro, this.dialogConfig());
      this._dialogRefIntro.afterClosed().subscribe((result) => {
        if (result?.isContinue) {
          this.handleLevelDialogCLosed();
        } else {
          this.saveGame.ClearSaveState();
          const hadSavedGame = this.scoringManager.Level > 1;
          this.scoringManager.RestartGame();
          this._activeLevelSeed = PRNG.generateSeed();
          this._activeRng = new PRNG(this._activeLevelSeed);
          if (hadSavedGame) {
            this.initTextures();
            this.textureManager.LevelTexturesLoaded.pipe(
              filter((loaded) => loaded),
              take(1),
            ).subscribe(() => {
              this.handleLevelDialogCLosed();
            });
          } else {
            this.handleLevelDialogCLosed();
          }
        }
      });
    }
  }

  private initTextures(): void {
    this.gameEngine.InitLevelTypes(this.scoringManager.Level, this._activeRng);

    // select next level material type
    this.textureManager.InitLevelTextures(
      this.gameEngine.PlayableTextureCount,
      this.gameEngine.LevelMaterialType,
      this.gameEngine.LevelGeometryType,
      this._activeRng,
    );
  }

  private dialogConfig(height = ``): MatDialogConfig {
    let config: MatDialogConfig = {
      minWidth: 'min(20em, 92vw)',
      maxWidth: '92vw',
      maxHeight: '90dvh',
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
      this.objectManager.NextLevel(this.scoringManager.Level, true, this._activeRng);
    } else {
      this.scoringManager.NextLevel();
      this.objectManager.NextLevel(this.scoringManager.Level, true, this._activeRng);
    }
  }
}

export { GameContainer as GameContainerComponent };
