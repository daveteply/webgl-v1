import { Injectable, inject, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';

import { STORAGE_SAVE_STATE } from '../../game-constants';
import { SaveGameData } from './save-game-types';
import { StorageService } from '../../../shared/services/storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class SaveGameService {
  private storageService = inject(StorageService);

  private _savedGameData: SaveGameData | null = null;
  get SavedGameData(): SaveGameData | null {
    return this._savedGameData;
  }

  public HasSaveState(): Observable<boolean> {
    return new Observable((observer) => {
      const savedData = this.storageService.getItem<SaveGameData>(STORAGE_SAVE_STATE);
      if (savedData && typeof savedData.level === 'number' && savedData.level > 0) {
        this._savedGameData = savedData;
        observer.next(true);
      } else {
        this._savedGameData = null;
        observer.next(false);
      }
      observer.complete();
    });
  }

  public GetSaveState(): SaveGameData | null {
    if (!this._savedGameData) {
      this._savedGameData = this.storageService.getItem<SaveGameData>(STORAGE_SAVE_STATE);
    }
    return this._savedGameData;
  }

  public SaveState(level: number, score: number, moves: number): Observable<void> {
    return new Observable((observer) => {
      this._savedGameData = {
        level,
        score,
        moves,
        updatedAt: Date.now(),
      };
      this.storageService.setItem(STORAGE_SAVE_STATE, this._savedGameData);
      if (isDevMode()) {
        console.info(`Saved game checkpoint: Level ${level}, Score ${score}, Moves ${moves}`);
      }
      observer.next();
      observer.complete();
    });
  }

  public ClearSaveState(): void {
    this._savedGameData = null;
    this.storageService.removeItem(STORAGE_SAVE_STATE);
    if (isDevMode()) {
      console.info('Cleared saved game state');
    }
  }
}

export { SaveGameService as SaveGame };
