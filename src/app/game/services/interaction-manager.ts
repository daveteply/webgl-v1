import { Injectable, isDevMode, inject } from '@angular/core';
import { Subject, take } from 'rxjs';
import { MathUtils, Object3D, PerspectiveCamera, Raycaster, Vector2 } from 'three';

import {
  CAMERA_PAN_MAX_OFFSET,
  MINIMUM_MATCH_COUNT,
  MOVES_REMAINING_COUNT_PANIC,
  ROTATIONAL_CONSTANT,
} from '../game-constants';

import { GameWheel } from '../models/game-wheel';
import { GamePiece } from '../models/game-piece/game-piece';
import { PowerMoveType } from '../models/power-move-type';
import { GravityType } from '../models/gravity-type';
import { LevelOrientationType } from '../models/level-orientation-type';
import { AudioManagerService, AudioType } from '@rikkle/audio';
import { HapticsManagerService } from '@rikkle/shared';
import { GameEngineService } from './game-engine';
import { ObjectManagerService } from './object-manager';
import { ScoringManagerService } from './scoring-manager';
import { PostProcessingManagerService } from './post-processing-manager';
import { HintsManagerService, TutorialType } from './hints-manager';
import { EffectsManagerService } from './effects-manager';

@Injectable({
  providedIn: 'root',
})
export class InteractionManagerService {
  private objectManager = inject(ObjectManagerService);
  private effectsManager = inject(EffectsManagerService);
  private gameEngine = inject(GameEngineService);
  private scoringManager = inject(ScoringManagerService);
  private audioManager = inject(AudioManagerService);
  private postProcessingManager = inject(PostProcessingManagerService);
  private hapticsManager = inject(HapticsManagerService);
  private hintsManager = inject(HintsManagerService);

  private _canvasRect!: DOMRect;
  set CanvasRect(rect: DOMRect) {
    this._canvasRect = rect;
  }

  private _pointerPos: Vector2 = new Vector2();
  private _rayCaster: Raycaster = new Raycaster();
  private _perspectiveCamera!: PerspectiveCamera;

  private _activeWheel: GameWheel | undefined;
  private _matchingPieces: GamePiece[] = [];

  // Panning State for Horizontal Levels
  private _panOffset = 0; // range [-1.0, 1.0]
  get PanOffset(): number {
    return this._panOffset;
  }
  public PanChange: Subject<number> = new Subject<number>();

  // Pointer Interaction State (Native replacement for Hammer.js)
  private _locked = false;
  private _isPointerDown = false;
  private _isDragging = false;
  private _startX = 0;
  private _startY = 0;
  private _lastX = 0;
  private _lastY = 0;

  private _element: HTMLElement | undefined;

  public SetCamera(camera: PerspectiveCamera): void {
    this._perspectiveCamera = camera;
  }

  public SetPan(offset: number): void {
    this._panOffset = Math.max(-1, Math.min(1, offset));
    this.updateCameraPan();
    this.PanChange.next(this._panOffset);
  }

  private updateCameraPan(): void {
    if (!this._perspectiveCamera || !this.gameEngine.IsHorizontal) {
      return;
    }
    const sign = this.gameEngine.LevelOrientation === LevelOrientationType.HorizontalRight ? -1 : 1;
    this._perspectiveCamera.position.y = this._panOffset * CAMERA_PAN_MAX_OFFSET * sign;
  }

  constructor() {
    this.effectsManager.LevelChangeAnimation.subscribe((start) => {
      this.LockBoard(start);
      if (start) {
        this._panOffset = 0;
        this.PanChange.next(0);
      }
    });

    this.effectsManager.SelectionAnimationComplete.subscribe((selectionMode) => {
      // selection animation complete
      if (selectionMode) {
        if (this._matchingPieces.length >= MINIMUM_MATCH_COUNT) {
          // update score
          this.scoringManager.UpdateScore(this._matchingPieces.length, this.scoringManager.LevelComplete);
          // long match audio
          if (this._matchingPieces.length > MINIMUM_MATCH_COUNT) {
            this.audioManager.PlayLongMatch(this._matchingPieces.length);
          }

          // stop panic music
          if (this.scoringManager.PlayerMoves > MOVES_REMAINING_COUNT_PANIC) {
            this.audioManager.StopAudio(AudioType.PIECE_MOVE_REMAINING_PANIC);
          }

          // level completed
          if (this.scoringManager.LevelComplete) {
            this.scoringManager.CheckPerfectMatch();
            this.effectsManager.RemoveAnimationComplete.pipe(take(1)).subscribe(() => {
              this.audioManager.PlayLevelComplete();
              this.hapticsManager.LevelCompletePulse();
              this.objectManager.AnimateLevelComplete();
              this.LockBoard(false);

              this.objectManager.LevelCompleted.next(false);
            });
            this.effectsManager.AnimateRemove(this._matchingPieces);
          } else {
            // power move
            let powerMovePiece: GamePiece | undefined;
            const moveType = this.gameEngine.EvaluatePowerMove(this._matchingPieces.length, this.scoringManager.Level);
            if (moveType !== PowerMoveType.None) {
              if (isDevMode()) {
                console.info('Power Move Awarded:', PowerMoveType[moveType]);
              }
              powerMovePiece = this._matchingPieces[0];
              this.audioManager.PlayAudio(AudioType.POWER_MOVE_APPEAR);
              this.objectManager.GamePiecePowerMove(powerMovePiece, moveType);
              this.hintsManager.ShowTutorial(TutorialType.PowerMove);
            }

            // Animate removal of matched pieces (excluding the piece that became a power move)
            const piecesToRemove = powerMovePiece
              ? this._matchingPieces.filter((p) => p !== powerMovePiece)
              : this._matchingPieces;

            // Gravity animation
            if (this.gameEngine.GravityType !== GravityType.None) {
              this.effectsManager.RemoveAnimationComplete.pipe(take(1)).subscribe(() => {
                this.effectsManager.GravityAnimationComplete.pipe(take(1)).subscribe(() => {
                  this.effectsManager.ClearSelectedPieces();
                  this.postProcessingManager.UpdateOutlinePassObjects([]);
                  this.objectManager.ResetIsMatch();
                  this.effectsManager.AnimateLock(this.objectManager.Axle, false);
                  this.LockBoard(false);
                });

                this.effectsManager.AnimateGravity(this.objectManager.Axle, this.gameEngine.GravityType);
              });
              this.effectsManager.AnimateRemove(piecesToRemove);
            } else {
              this.effectsManager.RemoveAnimationComplete.pipe(take(1)).subscribe(() => {
                this.effectsManager.ClearSelectedPieces();
                this.postProcessingManager.UpdateOutlinePassObjects([]);
                this.objectManager.ResetIsMatch();
                this.effectsManager.AnimateLock(this.objectManager.Axle, false);
                this.LockBoard(false);
              });
              this.effectsManager.AnimateRemove(piecesToRemove);
            }
          }
        } else {
          // unselect
          this.effectsManager.AnimateLock(this.objectManager.Axle, false);
          this.effectsManager.AnimateSelected(this._matchingPieces, false);
        }
      } else {
        this.LockBoard(false);
      }
    });
  }

  public InitInteractions(el: HTMLElement): void {
    this._element = el;
    el.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
  }

  public Dispose(): void {
    if (this._element) {
      this._element.removeEventListener('pointerdown', this.onPointerDown);
      this._element = undefined;
    }
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
  }

  public LockBoard(locked: boolean): void {
    this._locked = locked;
    if (locked) {
      this._isPointerDown = false;
      this._isDragging = false;
      this._activeWheel = undefined;
    }
  }

  private onPointerDown = (event: PointerEvent): void => {
    this.hintsManager.CancelIdleTimer();
    if (this._locked) return;

    if (this._element) {
      this._canvasRect = this._element.getBoundingClientRect();
    }

    this._isPointerDown = true;
    this._isDragging = false;
    this._startX = event.clientX;
    this._startY = event.clientY;
    this._lastX = event.clientX;
    this._lastY = event.clientY;

    const gamePiece = this.getPickedGamePiece(event.clientX, event.clientY);
    if (gamePiece && !gamePiece.IsRemoved) {
      this._activeWheel = gamePiece.parent as GameWheel;
      this._activeWheel.UpdateMoveStartTheta();
    }
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this._isPointerDown || this._locked) return;

    if (this._canvasRect) {
      const isOutside =
        event.clientX < this._canvasRect.left ||
        event.clientX > this._canvasRect.right ||
        event.clientY < this._canvasRect.top ||
        event.clientY > this._canvasRect.bottom;

      if (isOutside) {
        if (this._isDragging) {
          this.onPointerUp(event);
        } else {
          this._isPointerDown = false;
          this._activeWheel = undefined;
        }
        return;
      }
    }

    const dist = Math.hypot(event.clientX - this._startX, event.clientY - this._startY);
    if (dist > 6) {
      this._isDragging = true;
    }

    if (this._isDragging) {
      const deltaX = event.clientX - this._lastX;
      const deltaY = event.clientY - this._lastY;

      if (this.gameEngine.IsHorizontal) {
        if (this._activeWheel) {
          this.deviceCordRotation(deltaY);
        } else if (Math.abs(deltaX) > 0) {
          const panStep = (deltaX / this._canvasRect.width) * -2.0;
          this.SetPan(this._panOffset + panStep);
        }
      } else {
        if (this._activeWheel) {
          this.deviceCordRotation(deltaX);
        }
      }
    }

    this._lastX = event.clientX;
    this._lastY = event.clientY;
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (!this._isPointerDown) return;
    this._isPointerDown = false;

    if (this._isDragging) {
      this._isDragging = false;
      if (this._activeWheel) {
        if (this._activeWheel.SnapToGrid()) {
          this.audioManager.PlayAudio(AudioType.PIECE_MOVE);
          this.hapticsManager.SnapTap();
          this.scoringManager.UpdateMoveCount();

          // panic
          if (this.scoringManager.PlayerMoves === MOVES_REMAINING_COUNT_PANIC) {
            this.audioManager.PlayAudio(AudioType.PIECE_MOVE_REMAINING_PANIC, false, true);
          }

          if (this.scoringManager.GameOver) {
            this.audioManager.PlayAudio(AudioType.GAME_OVER);
            this.audioManager.StopAudio(AudioType.PIECE_MOVE_REMAINING_PANIC);
            this.objectManager.LevelCompleted.next(true);
          }
        } else {
          this.audioManager.PlayAudio(AudioType.PIECE_NON_MOVE);
        }
        this._activeWheel = undefined;
      }
    } else if (!this._locked) {
      // Tap / Click event
      this.handleTapOrPress(event.clientX, event.clientY);
    }
  };

  private handleTapOrPress(x: number, y: number): void {
    // prevent further input
    this.LockBoard(true);

    // find selected game piece
    const gamePiece = this.getPickedGamePiece(x, y);
    if (gamePiece && !gamePiece.IsRemoved) {
      // power move
      if (gamePiece.IsPowerMove) {
        this.powerMove(gamePiece);
      } else {
        // run matches algorithm
        this._matchingPieces = this.gameEngine.FindMatches(gamePiece, this.objectManager.Axle);

        // launch animation sequence
        this.effectsManager.AnimateSelected(this._matchingPieces, true);
        this.effectsManager.AnimateLock(this.objectManager.Axle, true);
      }
      this.postProcessingManager.UpdateOutlinePassObjects(this.effectsManager.SelectedPieces);
    } else {
      // unlock board if no pieces selected
      this.LockBoard(false);
    }
  }

  private powerMove(targetGamePiece: GamePiece): void {
    this.LockBoard(true);

    // find other power moves
    const powerMoveGamePieces: GamePiece[] = [];
    this.objectManager.Axle.forEach((gameWheel) => {
      for (const gamePiece of gameWheel.children as GamePiece[]) {
        if (gamePiece.IsPowerMove && gamePiece.id !== targetGamePiece.id) {
          powerMoveGamePieces.push(gamePiece);
        }
      }
    });

    // execute power move
    this.scoringManager.UpdateMoveCount();
    const moveType = targetGamePiece.PowerMoveType;
    targetGamePiece.PowerMoveRemove();
    this.scoringManager.UpdatePowerMoveBonus(powerMoveGamePieces.length, moveType);

    // power move could have been the player's last move
    if (this.scoringManager.GameOver) {
      this.audioManager.PlayAudio(AudioType.GAME_OVER);
      this.objectManager.LevelCompleted.next(true);
      this.audioManager.StopAudio(AudioType.PIECE_MOVE_REMAINING_PANIC);
      this.LockBoard(false);
    } else {
      this.hapticsManager.PowerMovePulse();

      if (moveType === PowerMoveType.Bomb) {
        this.audioManager.PlayAudio(AudioType.POWER_MOVE_BOMB);

        const bombTargets = this.gameEngine.FindBombTargets(
          targetGamePiece,
          this.objectManager.Axle,
          this.scoringManager.Level,
        );

        const otherTargets = bombTargets.filter((p) => p !== targetGamePiece);
        if (otherTargets.length) {
          otherTargets.forEach(() => {
            this.scoringManager.UpdateLevelProgress();
          });
        }

        if (this.scoringManager.LevelComplete) {
          this.scoringManager.CheckPerfectMatch();
          this.effectsManager.RemoveAnimationComplete.pipe(take(1)).subscribe(() => {
            this.audioManager.PlayLevelComplete();
            this.hapticsManager.LevelCompletePulse();
            this.objectManager.AnimateLevelComplete();
            this.LockBoard(false);
            this.objectManager.LevelCompleted.next(false);
          });
          this.effectsManager.AnimateRemove(otherTargets);
        } else if (this.gameEngine.GravityType !== GravityType.None) {
          this.effectsManager.RemoveAnimationComplete.pipe(take(1)).subscribe(() => {
            this.effectsManager.GravityAnimationComplete.pipe(take(1)).subscribe(() => {
              this.effectsManager.ClearSelectedPieces();
              this.postProcessingManager.UpdateOutlinePassObjects([]);
              this.objectManager.ResetIsMatch();
              this.effectsManager.AnimateLock(this.objectManager.Axle, false);
              this.LockBoard(false);
            });
            this.effectsManager.AnimateGravity(this.objectManager.Axle, this.gameEngine.GravityType);
          });
          this.effectsManager.AnimateRemove(otherTargets);
        } else {
          this.effectsManager.RemoveAnimationComplete.pipe(take(1)).subscribe(() => {
            this.effectsManager.ClearSelectedPieces();
            this.postProcessingManager.UpdateOutlinePassObjects([]);
            this.objectManager.ResetIsMatch();
            this.effectsManager.AnimateLock(this.objectManager.Axle, false);
            this.LockBoard(false);
          });
          this.effectsManager.AnimateRemove(otherTargets);
        }
      } else {
        this.audioManager.PlayAudio(AudioType.POWER_MOVE_USE);
        this.effectsManager.PowerMoveAnimationComplete.pipe(take(1)).subscribe(() => {
          this.LockBoard(false);
        });
        this.objectManager.AnimatePowerMove(moveType);
      }

      // panic
      if (this.scoringManager.PlayerMoves === MOVES_REMAINING_COUNT_PANIC) {
        this.audioManager.PlayAudio(AudioType.PIECE_MOVE_REMAINING_PANIC, false, true);
      } else if (this.scoringManager.PlayerMoves > MOVES_REMAINING_COUNT_PANIC) {
        this.audioManager.StopAudio(AudioType.PIECE_MOVE_REMAINING_PANIC);
      }
    }

    powerMoveGamePieces.forEach((gamePiece) => {
      gamePiece.PowerMoveRemove();
    });
  }

  private deviceCordRotation(delta: number): void {
    if (this._activeWheel) {
      if (this.gameEngine.IsHorizontal) {
        const sign = this.gameEngine.LevelOrientation === LevelOrientationType.HorizontalRight ? 1 : -1;
        this._activeWheel.UpdateTheta(
          MathUtils.degToRad(delta) * (ROTATIONAL_CONSTANT / (this._canvasRect?.height || 300)) * sign,
        );
      } else {
        this._activeWheel.UpdateTheta(
          MathUtils.degToRad(delta) * (ROTATIONAL_CONSTANT / (this._canvasRect?.width || 300)) * -1,
        );
      }
    }
  }

  private getPickedGamePiece(x: number, y: number): GamePiece | undefined {
    if (!this._canvasRect || !this._perspectiveCamera) return undefined;

    const width = this._canvasRect.right - this._canvasRect.left;
    const height = this._canvasRect.bottom - this._canvasRect.top;

    this._pointerPos.x = ((x - Math.floor(this._canvasRect.left)) / width) * 2 - 1;
    this._pointerPos.y = -((y - Math.floor(this._canvasRect.top)) / height) * 2 + 1;

    this._rayCaster.setFromCamera(this._pointerPos, this._perspectiveCamera);
    const intersects = this.objectManager?.Axle ? this._rayCaster.intersectObjects(this.objectManager.Axle) : [];
    if (intersects.length) {
      let target: Object3D | null = intersects[0].object;
      while (target && !(target instanceof GamePiece)) {
        target = target.parent;
      }
      return target ? (target as GamePiece) : undefined;
    } else {
      return undefined;
    }
  }
}
