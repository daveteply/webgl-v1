import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { STORAGE_HIGH_SCORES } from '../../game/game-constants';

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
  public UpdateHighScores(gameOverScore: number): void {
    // Capacitor Preferences removed; using Web localStorage instead
    const rawData = localStorage.getItem(STORAGE_HIGH_SCORES);
    if (rawData) {
      const scores: HighScore[] = JSON.parse(rawData);
      // clear highlights
      scores.forEach((s) => (s.highlight = false));
      // add new element
      scores.push({ occurred: new Date(), score: gameOverScore, highlight: true });
      // sort by highest score
      scores.sort((a, b) => (a.score > b.score ? -1 : 1));
      // store only 5 highest scores
      this.storeScores(scores.slice(0, 5));
    } else {
      const scores: HighScore[] = [];
      scores.push({ occurred: new Date(), score: gameOverScore, highlight: true });
      this.storeScores(scores);
    }
  }

  public GetHighScores(): Observable<HighScore[]> {
    return new Observable((observer) => {
      // Capacitor Preferences removed; using Web localStorage instead
      const rawData = localStorage.getItem(STORAGE_HIGH_SCORES);
      if (rawData) {
        observer.next(JSON.parse(rawData));
        observer.complete();
      } else {
        observer.complete();
      }
    });
  }

  private storeScores(scores: HighScore[]): void {
    // Capacitor Preferences removed; using Web localStorage instead
    localStorage.setItem(STORAGE_HIGH_SCORES, JSON.stringify(scores));
  }
}
