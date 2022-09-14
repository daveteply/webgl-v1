import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';
import { Observable } from 'rxjs';

import { STORAGE_SAVE_STATE } from '../../game-constants';
import { GamePiece } from '../../models/game-piece/game-piece';
import { GamePieceMaterialData } from '../../models/game-piece/game-piece-material-data';
import { GameWheel } from '../../models/game-wheel';
import { SaveGameData, SaveGameScore, SavePieceData, SaveWheelData } from './save-game-data';
import { GameMaterials } from 'src/app/game/services/material/material-models';

@Injectable({
  providedIn: 'root',
})
export class SaveGameService {
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
      Preferences.get({ key: STORAGE_SAVE_STATE }).then((data) => {
        if (data.value) {
          this._savedGameData = JSON.parse(data.value);
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      });
    });
  }

  public SaveState(
    gameWheels: GameWheel[],
    levelMaterials: GamePieceMaterialData[],
    gameMaterials: GameMaterials,
    levelMaterialType: number,
    levelGeometryType: number,
    score: SaveGameScore,
    outlineColor: number
  ): Observable<void> {
    return new Observable((observer) => {
      Preferences.remove({ key: STORAGE_SAVE_STATE }).then(() => {
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
            emojiSequence: material.texture?.texture?.userData?.sequence,
          });
        }

        // piece material data
        this._savedGameData.gameMaterials = gameMaterials.wheelMaterials.map((w) =>
          w.pieceMaterials.map((p) => p.materials.map((m) => m.matchKey))
        );

        // level info
        this._savedGameData.levelGeometryType = levelGeometryType;
        this._savedGameData.levelMaterialType = levelMaterialType;
        this._savedGameData.scoring = score;

        // misc
        this._savedGameData.outlineColor = outlineColor;

        Preferences.set({ key: STORAGE_SAVE_STATE, value: JSON.stringify(this._savedGameData) }).then(() => {
          observer.next();
          observer.complete();
        });
      });
    });
  }

  public RestoreState(): void {
    // restore game state
    this._isRestoring = true;

    if (!environment.production) {
      console.info('-= RESTORING =-');
    }
  }

  public RestoreComplete(): void {
    this._isRestoring = false;

    // clear preference so next time
    // Preferences.remove({ key: STORAGE_SAVE_STATE });
  }
}
