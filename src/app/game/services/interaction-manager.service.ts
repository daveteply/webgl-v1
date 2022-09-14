import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { MathUtils, PerspectiveCamera, Raycaster, Vector2 } from 'three';

import 'hammerjs';

import {
  DIFFICULTY_TIER_2,
  MINIMUM_MATCH_COUNT,
  MOVES_REMAINING_COUNT_PANIC,
  ROTATIONAL_CONSTANT,
} from '../game-constants';

import { GameWheel } from '../models/game-wheel';
import { GamePiece } from '../models/game-piece/game-piece';
import { PowerMoveType } from '../models/power-move-type';
import { AudioType } from 'src/app/shared/services/audio/audio-info';

import { GameEngineService } from './game-engine.service';
import { ObjectManagerService } from './object-manager.service';
import { ScoringManagerService } from './scoring-manager.service';
import { EffectsManagerService } from './effects-manager.service';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { PostProcessingManagerService } from './post-processing-manager.service';

enum HammerEvents {
  PAN = 'pan',
  PAN_START = 'panstart',
  TAP = 'tap',
  PRESS = 'press',
}

@Injectable()
export class InteractionManagerService {
  private _hammer!: HammerManager;

  private _canvasRect!: DOMRect;
  set CanvasRect(rect: DOMRect) {
    this._canvasRect = rect;
  }

  private _pointerPos: Vector2;

  private _x: number = 0;
  private _panning: boolean = false;
  private _activeWheel: GameWheel | undefined;

  private _rayCaster!: Raycaster;

  private _perspectiveCamera!: PerspectiveCamera;

  public SetCamera(camera: PerspectiveCamera): void {
    this._perspectiveCamera = camera;
  }

  private _matchingPieces: GamePiece[] = [];

  constructor(
    private objectManager: ObjectManagerService,
    private effectsManager: EffectsManagerService,
    private gameEngine: GameEngineService,
    private scoringManager: ScoringManagerService,
    private audioManager: AudioManagerService,
    private postProcessingManager: PostProcessingManagerService
  ) {
    this._rayCaster = new Raycaster();
    this._pointerPos = new Vector2();

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
            this.objectManager.AnimateLevelComplete();
            this.LockBoard(false);

            this.objectManager.LevelCompleted.next(false);
          } else {
            // power move
            let powerMoveTarget =
              this.scoringManager.Level >= DIFFICULTY_TIER_2 ? MINIMUM_MATCH_COUNT : MINIMUM_MATCH_COUNT + 1;
            if (this._matchingPieces.length >= powerMoveTarget) {
              if (!environment.production) {
                console.info('Power Move Candidate Match!');
              }
              const moveType = this.gameEngine.PowerMoveSelection(this.scoringManager.Level);
              if (moveType !== PowerMoveType.None) {
                if (!environment.production) {
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
    this._hammer = new Hammer(el);
    this.initPanStartEvent();
    this.initPanEvent();
    this.initTapAndPressEvents();
  }

  public LockBoard(locked: boolean): void {
    this._hammer.get(HammerEvents.PAN).set({ enable: !locked });
    this._hammer.get(HammerEvents.TAP).set({ enable: !locked });
    this._hammer.get(HammerEvents.PRESS).set({ enable: !locked });
  }

  private initPanStartEvent(): void {
    this._hammer.on(HammerEvents.PAN_START, (panStartEvent: HammerInput) => {
      const gamePiece = this.getPickedGamePiece(panStartEvent.center.x, panStartEvent.center.y);
      if (gamePiece && !gamePiece?.IsRemoved) {
        this._activeWheel = gamePiece.parent as GameWheel;
        this._activeWheel.UpdateMoveStartTheta();
      }
    });
  }

  private initPanEvent(): void {
    this._hammer.on(HammerEvents.PAN, (panEvent) => {
      if (!this._panning) {
        this._panning = true;
      } else {
        this.deviceCordRotation(panEvent.center.x);
      }

      if (panEvent.isFinal) {
        this._panning = false;
        if (this._activeWheel?.SnapToGrid()) {
          this.audioManager.PlayAudio(AudioType.PIECE_MOVE);
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
      this._x = panEvent.center.x;
    });
  }

  private initTapAndPressEvents(): void {
    this._hammer.on(HammerEvents.TAP, (tapEvent) => this.handleTapOrPress(tapEvent));
    this._hammer.on(HammerEvents.PRESS, (pressEvent) => {
      this.handleTapOrPress(pressEvent);
    });
  }

  private handleTapOrPress(event: HammerInput): void {
    // prevent further input
    this.LockBoard(true);

    // find selected game piece
    const gamePiece = this.getPickedGamePiece(event.center.x, event.center.y);
    if (gamePiece && !gamePiece?.IsRemoved) {
      // power move
      if (gamePiece.IsPowerMove) {
        this.powerMove(gamePiece);
      } else {
        // run matches algorithm
        this._matchingPieces = this.gameEngine.FindMatches(gamePiece, this.objectManager.Axle);

        // launch animation sequence
        this.effectsManager.AnimateSelected(this._matchingPieces, true);
        this.effectsManager.AnimateLock(this.objectManager.Axle, true);
        this.postProcessingManager.UpdateOutlinePassObjects(this.effectsManager.SelectedPieces);
      }
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
    if (this.scoringManager.GameOver) {
      this.audioManager.PlayAudio(AudioType.GAME_OVER);
      this.objectManager.LevelCompleted.next(true);
      this.audioManager.StopAudio(AudioType.PIECE_MOVE_REMAINING_PANIC);
    } else {
      this.scoringManager.UpdatePowerMoveBonus(powerMoveGamePieces.length);
      this.audioManager.PlayAudio(AudioType.POWER_MOVE_USE);
      this.objectManager.AnimatePowerMove(targetGamePiece.PowerMoveType);
      // panic
      if (this.scoringManager.PlayerMoves === MOVES_REMAINING_COUNT_PANIC) {
        this.audioManager.PlayAudio(AudioType.PIECE_MOVE_REMAINING_PANIC, false, true);
      }
    }

    // clear other power moves
    //  Reason: player could engage another power move while the
    //   initial power move was still animating.  This caused havoc
    //   with placement, etc.  Was simpler to do this than to figure out
    //   when the current power move was done animating.
    powerMoveGamePieces.forEach((gamePiece) => {
      gamePiece.PowerMoveRemove();
    });

    // unlock the game board
    this.LockBoard(false);
  }

  private deviceCordRotation(x: number): void {
    const deltaX = x - this._x;
    if (this._activeWheel) {
      this._activeWheel.UpdateTheta(MathUtils.degToRad(deltaX) * (ROTATIONAL_CONSTANT / this._canvasRect.width) * -1);
    }
  }

  private getPickedGamePiece(x: number, y: number): GamePiece | undefined {
    const width = this._canvasRect.right - this._canvasRect.left;
    const height = this._canvasRect.bottom - this._canvasRect.top;

    this._pointerPos.x = ((x - Math.floor(this._canvasRect.left)) / width) * 2 - 1;
    this._pointerPos.y = -((y - Math.floor(this._canvasRect.top)) / height) * 2 + 1;

    this._rayCaster.setFromCamera(this._pointerPos, this._perspectiveCamera);
    const intersects = this._rayCaster.intersectObjects(this.objectManager.Axle);
    if (intersects.length) {
      const castTarget = intersects[0].object;
      // target may be "inner" game piece
      if (castTarget.parent instanceof GamePiece) {
        return castTarget.parent;
      } else {
        // TODO: why is this here?
        return castTarget as GamePiece;
      }
    } else {
      return undefined;
    }
  }
}
