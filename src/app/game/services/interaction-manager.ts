import { Injectable, isDevMode, inject } from '@angular/core';
import { MathUtils, Object3D, PerspectiveCamera, Raycaster, Vector2 } from 'three';

import {
  DIFFICULTY_TIER_2,
  MINIMUM_MATCH_COUNT,
  MOVES_REMAINING_COUNT_PANIC,
  ROTATIONAL_CONSTANT,
} from '../game-constants';

import { GameWheel } from '../models/game-wheel';
import { GamePiece } from '../models/game-piece/game-piece';
import { PowerMoveType } from '../models/power-move-type';
import { AudioType } from '../../shared/services/audio/audio-data';

import { GameEngineService } from './game-engine';
import { ObjectManagerService } from './object-manager';
import { ScoringManagerService } from './scoring-manager';
import { EffectsManagerService } from './effects-manager';
import { AudioManagerService } from '../../shared/services/audio/audio-manager';
import { PostProcessingManagerService } from './post-processing-manager';
import { HapticsManagerService } from '../../shared/services/haptics-manager';

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

  private _canvasRect!: DOMRect;
  set CanvasRect(rect: DOMRect) {
    this._canvasRect = rect;
  }

  private _pointerPos: Vector2 = new Vector2();
  private _rayCaster: Raycaster = new Raycaster();
  private _perspectiveCamera!: PerspectiveCamera;

  private _activeWheel: GameWheel | undefined;
  private _matchingPieces: GamePiece[] = [];

  // Pointer Interaction State (Native replacement for Hammer.js)
  private _locked = false;
  private _isPointerDown = false;
  private _isDragging = false;
  private _startX = 0;
  private _startY = 0;
  private _lastX = 0;

  private _element: HTMLElement | undefined;

  public SetCamera(camera: PerspectiveCamera): void {
    this._perspectiveCamera = camera;
  }

  constructor() {
    this.effectsManager.LevelChangeAnimation.subscribe((start) => {
      this.LockBoard(start);
    });

    this.effectsManager.SelectionAnimationComplete.subscribe((selectionMode) => {
      // selection animation complete
      if (selectionMode) {
        if (this._matchingPieces.length >= MINIMUM_MATCH_COUNT) {
          // initiate the removal animation
          this.effectsManager.AnimateRemove(this._matchingPieces);
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
            this.audioManager.PlayLevelComplete();
            this.hapticsManager.LevelCompletePulse();
            this.objectManager.AnimateLevelComplete();
            this.LockBoard(false);

            this.objectManager.LevelCompleted.next(false);
          } else {
            // power move
            const powerMoveTarget =
              this.scoringManager.Level >= DIFFICULTY_TIER_2 ? MINIMUM_MATCH_COUNT : MINIMUM_MATCH_COUNT + 1;
            if (this._matchingPieces.length >= powerMoveTarget) {
              if (isDevMode()) {
                console.info('Power Move Candidate Match!');
              }
              const moveType = this.gameEngine.PowerMoveSelection(this.scoringManager.Level);
              if (moveType !== PowerMoveType.None) {
                if (isDevMode()) {
                  console.info('  ', PowerMoveType[moveType]);
                }
                this.audioManager.PlayAudio(AudioType.POWER_MOVE_APPEAR);
                this.objectManager.GamePiecePowerMove(this._matchingPieces[0], moveType);
              }
            }

            this.effectsManager.AnimateLock(this.objectManager.Axle, false);
            this.LockBoard(false);
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

  public LockBoard(locked: boolean): void {
    this._locked = locked;
    if (locked) {
      this._isPointerDown = false;
      this._isDragging = false;
      this._activeWheel = undefined;
    }
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (this._locked) return;

    this._isPointerDown = true;
    this._isDragging = false;
    this._startX = event.clientX;
    this._startY = event.clientY;
    this._lastX = event.clientX;

    const gamePiece = this.getPickedGamePiece(event.clientX, event.clientY);
    if (gamePiece && !gamePiece.IsRemoved) {
      this._activeWheel = gamePiece.parent as GameWheel;
      this._activeWheel.UpdateMoveStartTheta();
    }
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this._isPointerDown || this._locked) return;

    const dist = Math.hypot(event.clientX - this._startX, event.clientY - this._startY);
    if (dist > 6) {
      this._isDragging = true;
    }

    if (this._isDragging && this._activeWheel) {
      const deltaX = event.clientX - this._lastX;
      this.deviceCordRotation(deltaX);
    }

    this._lastX = event.clientX;
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
    targetGamePiece.PowerMoveRemove();

    // power move could have been the player's last move
    if (this.scoringManager.GameOver) {
      this.audioManager.PlayAudio(AudioType.GAME_OVER);
      this.objectManager.LevelCompleted.next(true);
      this.audioManager.StopAudio(AudioType.PIECE_MOVE_REMAINING_PANIC);
    } else {
      this.scoringManager.UpdatePowerMoveBonus(powerMoveGamePieces.length, targetGamePiece.PowerMoveType);
      this.audioManager.PlayAudio(AudioType.POWER_MOVE_USE);
      this.hapticsManager.PowerMovePulse();
      if (targetGamePiece.PowerMoveType === PowerMoveType.Additive) {
        // additive power move
        this.objectManager.AdditivePowerMove();
      } else {
        this.objectManager.AnimatePowerMove(targetGamePiece.PowerMoveType);
      }
      // panic
      if (this.scoringManager.PlayerMoves === MOVES_REMAINING_COUNT_PANIC) {
        this.audioManager.PlayAudio(AudioType.PIECE_MOVE_REMAINING_PANIC, false, true);
      }
    }

    powerMoveGamePieces.forEach((gamePiece) => {
      gamePiece.PowerMoveRemove();
    });

    // unlock the game board
    this.LockBoard(false);
  }

  private deviceCordRotation(deltaX: number): void {
    if (this._activeWheel) {
      this._activeWheel.UpdateTheta(MathUtils.degToRad(deltaX) * (ROTATIONAL_CONSTANT / this._canvasRect.width) * -1);
    }
  }

  private getPickedGamePiece(x: number, y: number): GamePiece | undefined {
    if (!this._canvasRect) return undefined;

    const width = this._canvasRect.right - this._canvasRect.left;
    const height = this._canvasRect.bottom - this._canvasRect.top;

    this._pointerPos.x = ((x - Math.floor(this._canvasRect.left)) / width) * 2 - 1;
    this._pointerPos.y = -((y - Math.floor(this._canvasRect.top)) / height) * 2 + 1;

    this._rayCaster.setFromCamera(this._pointerPos, this._perspectiveCamera);
    const intersects = this._rayCaster.intersectObjects(this.objectManager.Axle);
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

export { InteractionManagerService as InteractionManager };
