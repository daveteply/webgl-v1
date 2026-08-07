import { Injectable, inject, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';

import { STORAGE_SAVE_STATE } from '../../game-constants';
import { GamePiece } from '../../models/game-piece/game-piece';
import { GamePieceMaterialData } from '../../models/game-piece/game-piece-material-type';
import { GameWheel } from '../../models/game-wheel';
import { SaveGameData, SaveGameScore, SavePieceData, SaveWheelData } from './save-game-types';
import { GameMaterials } from '../material/material-models';
import { StorageService } from '../../../shared/services/storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class SaveGameService {
  private storageService = inject(StorageService);

  private _savedGameData: SaveGameData;
  get SavedGameData(): SaveGameData {
    return this._savedGameData;
  }

  private _isRestoring!: boolean;
  get IsRestoring(): boolean {
    return this._isRestoring;
  }

  constructor() {
    this._savedGameData = {
      wheelData: [],
      textureData: [],
    };
  }

  public HasSaveState(): Observable<boolean> {
    return new Observable((observer) => {
      const savedData = this.storageService.getItem<SaveGameData>(STORAGE_SAVE_STATE);
      if (savedData) {
        this._savedGameData = savedData;
        observer.next(true);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
  }

  public SaveState(
    gameWheels: GameWheel[],
    levelMaterials: GamePieceMaterialData[],
    gameMaterials: GameMaterials,
    levelMaterialType: number,
    levelGeometryType: number,
    score: SaveGameScore,
    outlineColor: number,
  ): Observable<void> {
    return new Observable((observer) => {
      this.storageService.removeItem(STORAGE_SAVE_STATE);
      this._savedGameData.wheelData = [];
      this._savedGameData.textureData = [];

      for (const gameWheel of gameWheels) {
        // wheel data
        const wheelData: SaveWheelData = { theta: gameWheel.Theta, piecesData: [] };

        for (const gamePiece of gameWheel.children as GamePiece[]) {
          // piece data
          const pieceData: SavePieceData = {
            isRemoved: gamePiece.IsRemoved,
            flipTurns: gamePiece.FlipTurns,
          };
          if (gamePiece.IsPowerMove) {
            pieceData.powerMove = gamePiece.PowerMoveType;
            pieceData.powerMoveColor = gamePiece.PowerMove?.PowerMoveColor;
          }
          wheelData.piecesData.push(pieceData);
        }

        this._savedGameData.wheelData.push(wheelData);
      }

      // materials data
      for (const material of levelMaterials.sort((a, b) => a.matchKey - b.matchKey)) {
        this._savedGameData.textureData.push({
          matchKey: material.matchKey,
          bumpId: material.bumpTexture?.id,
          textureId: material.texture?.id,
          colorStr: material.colorStr,
          emojiSequence: material.texture?.texture?.userData?.['sequence'],
        });
      }

      // piece material data
      this._savedGameData.gameMaterials = gameMaterials.wheelMaterials.map((w) =>
        w.pieceMaterials.map((p) => p.materials.map((m) => m.matchKey)),
      );

      // level info
      this._savedGameData.levelGeometryType = levelGeometryType;
      this._savedGameData.levelMaterialType = levelMaterialType;
      this._savedGameData.scoring = score;

      // misc
      this._savedGameData.outlineColor = outlineColor;

      this.storageService.setItem(STORAGE_SAVE_STATE, this._savedGameData);
      observer.next();
      observer.complete();
    });
  }

  public RestoreState(): void {
    // restore game state
    this._isRestoring = true;

    if (isDevMode()) {
      console.info('-= RESTORING =-');
    }
  }

  public RestoreComplete(): void {
    this._isRestoring = false;
  }
}

export { SaveGameService as SaveGame };
