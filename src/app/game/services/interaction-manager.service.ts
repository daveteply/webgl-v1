import { Injectable } from '@angular/core';
import { ObjectManagerService } from './object-manager.service';
import { MathUtils, PerspectiveCamera, Raycaster, Vector2 } from 'three';
import { ROTATIONAL_CONSTANT } from '../game-constants';
import { GameWheel } from '../models/game-wheel';
import { GameEngineService } from './game-engine.service';
import { GamePiece } from '../models/game-piece/game-piece';
import { ScoringManagerService } from './scoring-manager.service';
import { DIRECTION_UP } from 'hammerjs';
import 'hammerjs';

@Injectable()
export class InteractionManagerService {
  private _hammer!: HammerManager;

  private _canvasRect!: DOMRect;
  private _pointerPos: Vector2;

  private _x: number = 0;
  private _panning: boolean = false;
  private _activeWheel: GameWheel | undefined;

  private _rayCaster!: Raycaster;
  private _camera!: PerspectiveCamera;

  constructor(
    private objectManager: ObjectManagerService,
    private gameEngine: GameEngineService,
    private scoringManager: ScoringManagerService
  ) {
    this._rayCaster = new Raycaster();
    this._pointerPos = new Vector2();
  }

  public InitInteractions(el: HTMLElement): void {
    this._hammer = new Hammer(el);
    this._hammer.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });

    this._hammer.on('panstart', (panStartEvent: HammerInput) => {
      if (!this.objectManager.BoardLocked) {
        const gamePiece = this.getPickedGamePiece(
          panStartEvent.center.x,
          panStartEvent.center.y
        );
        if (gamePiece && !gamePiece?.IsRemoved) {
          this._activeWheel = gamePiece.parent as GameWheel;
          this.objectManager.SetActiveWheel(this._activeWheel);
        }
      }
    });

    this._hammer.on('pan', (panEvent) => {
      if (!this.objectManager.BoardLocked) {
        if (!this._panning) {
          this._panning = true;
        } else {
          this.deviceCordRotation(panEvent.center.x);
        }

        if (panEvent.isFinal) {
          this._panning = false;
          this._activeWheel?.SnapToGrid();
          this._activeWheel = undefined;
        }
        this._x = panEvent.center.x;
      }
    });

    this._hammer.on('press', (pressEvent) => {
      if (!this.objectManager.BoardLocked) {
        const gamePiece = this.getPickedGamePiece(
          pressEvent.center.x,
          pressEvent.center.y
        );
        if (gamePiece && !gamePiece?.IsRemoved) {
          // lock the game board if minimum matches found
          const matchingPieces = this.gameEngine.FindMatches(
            gamePiece,
            this.objectManager.Axle
          );
          if (matchingPieces.length) {
            this.objectManager.LockBoard(true);
            this.objectManager.SetMatches(matchingPieces);
            this.scoringManager.UpdateScore(matchingPieces.length);
            if (this.scoringManager.UpdateLevel(matchingPieces.length)) {
              this.objectManager.SetLevelChange();
            }
          }
        }
      }
    });

    // swipe recognizer is only configured for vertical
    this._hammer.on('swipe', (swipeEvent) => {
      if (!this.objectManager.BoardLocked) {
        const gamePiece = this.getPickedGamePiece(
          swipeEvent.center.x,
          swipeEvent.center.y - swipeEvent.deltaY
        );
        if (gamePiece) {
          gamePiece.InitFlip(swipeEvent.direction === DIRECTION_UP);
          this.objectManager.FlipGamePiece(gamePiece);
        }
      }
    });
  }

  public UpdateSize(rect: DOMRect, camera: PerspectiveCamera): void {
    this._canvasRect = rect;
    this._camera = camera;
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
