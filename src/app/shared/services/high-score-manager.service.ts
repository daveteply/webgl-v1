import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { Observable } from 'rxjs';
import { STORAGE_HIGH_SCORES } from 'src/app/game/game-constants';

export interface HighScore {
  occurred: Date;
  score: number;
}

@Injectable({
  providedIn: 'root',
})
export class HighScoreManagerService {
  public UpdateHighScores(gameOverScore: number): void {
    if (gameOverScore) {
      Storage.get({ key: STORAGE_HIGH_SCORES }).then((data) => {
        if (data.value) {
          const scores: HighScore[] = JSON.parse(data.value);
          // add new element
          scores.push({ occurred: new Date(), score: gameOverScore });
          // sort by highest score
          scores.sort((a, b) => (a.score > b.score ? -1 : 1));
          // store only 5 highest scores
          this.storeScores(scores.slice(0, 5));
        } else {
          const scores: HighScore[] = [];
          scores.push({ occurred: new Date(), score: gameOverScore });
          this.storeScores(scores);
        }
      });
    }
  }

  public GetHighScores(): Observable<HighScore[]> {
    return new Observable((observer) => {
      Storage.get({ key: STORAGE_HIGH_SCORES }).then((data) => {
        if (data.value) {
          observer.next(JSON.parse(data.value));
          observer.complete();
        } else {
          observer.complete();
        }
      });
    });
  }

  private storeScores(scores: HighScore[]): void {
    Storage.set({ key: STORAGE_HIGH_SCORES, value: JSON.stringify(scores) });
  }
}
