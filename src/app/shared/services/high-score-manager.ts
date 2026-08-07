import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { STORAGE_HIGH_SCORES } from '../../game/game-constants';
import { StorageService } from './storage/storage.service';

export interface HighScore {
  occurred: Date;
  score: number;
  highlight?: boolean;
  hasBeenHighlighted?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HighScoreManagerService {
  private storageService = inject(StorageService);

  public UpdateHighScores(gameOverScore: number): void {
    const scores = this.storageService.getItem<HighScore[]>(STORAGE_HIGH_SCORES);
    if (scores) {
      // clear highlights
      scores.forEach((s) => (s.highlight = false));
      // add new element
      scores.push({ occurred: new Date(), score: gameOverScore, highlight: true });
      // sort by highest score
      scores.sort((a, b) => (a.score > b.score ? -1 : 1));
      // store only 5 highest scores
      this.storeScores(scores.slice(0, 5));
    } else {
      const newScores: HighScore[] = [];
      newScores.push({ occurred: new Date(), score: gameOverScore, highlight: true });
      this.storeScores(newScores);
    }
  }

  public GetHighScores(): Observable<HighScore[]> {
    return new Observable((observer) => {
      const scores = this.storageService.getItem<HighScore[]>(STORAGE_HIGH_SCORES);
      if (scores) {
        observer.next(scores);
      }
      observer.complete();
    });
  }

  public ClearHighScores(): void {
    this.storageService.removeItem(STORAGE_HIGH_SCORES);
  }

  private storeScores(scores: HighScore[]): void {
    this.storageService.setItem(STORAGE_HIGH_SCORES, scores);
  }
}

export { HighScoreManagerService as HighScoreManager };
