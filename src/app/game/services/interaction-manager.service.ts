import { Injectable } from '@angular/core';

import { MathUtils, PerspectiveCamera, Raycaster, Vector2 } from 'three';

import { MINIMUM_MATCH_COUNT, ROTATIONAL_CONSTANT } from '../game-constants';

import { GameWheel } from '../models/game-wheel';
import { GameEngineService } from './game-engine.service';
import { GamePiece } from '../models/game-piece/game-piece';

import { ObjectManagerService } from './object-manager.service';
import { ScoringManagerService } from './scoring-manager.service';
import { EffectsManagerService } from './effects-manager.service';
import { AudioType } from 'src/app/shared/services/audio/audio-info';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';

import { DIRECTION_UP } from 'hammerjs';
import 'hammerjs';

enum HammerEvents {
  PAN = 'pan',
  PAN_START = 'panstart',
  SWIPE = 'swipe',
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

  private _camera!: PerspectiveCamera;
  set Camera(camera: PerspectiveCamera) {
    this._camera = camera;
  }

  private _matchingPieces: GamePiece[] = [];

  constructor(
    private objectManager: ObjectManagerService,
    private effectsManager: EffectsManagerService,
    private gameEngine: GameEngineService,
    private scoringManager: ScoringManagerService,
    private audioManager: AudioManagerService
  ) {
    this._rayCaster = new Raycaster();
    this._pointerPos = new Vector2();
  }

  public InitInteractions(el: HTMLElement): void {
    this._hammer = new Hammer(el);
    this._hammer
      .get(HammerEvents.SWIPE)
      .set({ direction: Hammer.DIRECTION_VERTICAL });

    this.initPanStartEvent();
    this.initPanEvent();
    this.initTapAndPressEvents();
    this.initSwipeEvent();

    this.effectsManager.LevelChangeAnimation.subscribe((start) => {
      this.LockBoard(start);
    });

    this.effectsManager.SelectionAnimationComplete.subscribe(
      (selectionMode) => {
        // selection animation complete
        if (selectionMode) {
          if (this._matchingPieces.length >= MINIMUM_MATCH_COUNT) {
            // initiate the removal animation
            this.effectsManager.AnimateRemove(this._matchingPieces);
            if (this.scoringManager.LevelComplete) {
              this.audioManager.PlayLevelComplete();
              this.objectManager.AnimateLevelComplete();
              this.LockBoard(false);
              this.objectManager.LevelCompleted.next(false);
            } else {
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
      }
    );
  }

  public LockBoard(locked: boolean): void {
    this._hammer.get(HammerEvents.SWIPE).set({ enable: !locked });
    this._hammer.get(HammerEvents.PAN).set({ enable: !locked });
    this._hammer.get(HammerEvents.TAP).set({ enable: !locked });
    this._hammer.get(HammerEvents.PRESS).set({ enable: !locked });
  }

  private initPanStartEvent(): void {
    this._hammer.on(HammerEvents.PAN_START, (panStartEvent: HammerInput) => {
      const gamePiece = this.getPickedGamePiece(
        panStartEvent.center.x,
        panStartEvent.center.y
      );
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
          if (this.scoringManager.GameOver) {
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

  private initSwipeEvent(): void {
    // swipe recognizer is only configured for vertical
    this._hammer.on(HammerEvents.SWIPE, (swipeEvent) => {
      const gamePiece = this.getPickedGamePiece(
        swipeEvent.center.x,
        swipeEvent.center.y - swipeEvent.deltaY
      );
      if (gamePiece && !gamePiece?.IsRemoved) {
        this.effectsManager.AnimateFlip(
          gamePiece,
          Math.abs(swipeEvent.velocity),
          swipeEvent.direction === DIRECTION_UP
        );
        this.scoringManager.UpdateMoveCount();
        if (this.scoringManager.GameOver) {
          this.objectManager.LevelCompleted.next(true);
        }
      }
    });
  }

  private initTapAndPressEvents(): void {
    this._hammer.on(HammerEvents.TAP, (tapEvent) =>
      this.handleTapOrPress(tapEvent)
    );
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
      // run matches algorithm
      this._matchingPieces = this.gameEngine.FindMatches(
        gamePiece,
        this.objectManager.Axle
      );

      // launch animation sequence
      this.effectsManager.AnimateSelected(this._matchingPieces, true);
      this.effectsManager.AnimateLock(this.objectManager.Axle, true);
    } else {
      // unlock board if no pieces selected
      this.LockBoard(false);
    }
  }

  private deviceCordRotation(x: number): void {
    const deltaX = x - this._x;
    if (this._activeWheel) {
      this._activeWheel.UpdateTheta(
        MathUtils.degToRad(deltaX) *
          (ROTATIONAL_CONSTANT / this._canvasRect.width) *
          -1
      );
    }
  }

  private getPickedGamePiece(x: number, y: number): GamePiece | undefined {
    const width = this._canvasRect.right - this._canvasRect.left;
    const height = this._canvasRect.bottom - this._canvasRect.top;

    this._pointerPos.x = ((x - this._canvasRect.left) / width) * 2 - 1;
    this._pointerPos.y = -((y - this._canvasRect.top) / height) * 2 + 1;

    this._rayCaster.setFromCamera(this._pointerPos, this._camera);
    const intersects = this._rayCaster.intersectObjects(
      this.objectManager.Axle
    );
    if (intersects.length) {
      const castTarget = intersects[0].object;
      // target may be "inner" game piece
      if (castTarget.parent instanceof GamePiece) {
        return castTarget.parent;
      } else {
        return castTarget as GamePiece;
      }
    } else {
      return undefined;
    }
  }
}
