import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { Observable } from 'rxjs';

export interface HighScore {
  occurred: Date;
  score: number;
}

@Injectable({
  providedIn: 'root',
})
export class HighScoreManagerService {
  _highScoresKey = 'HIGH_SCORES';

  constructor() {}

  public UpdateHighScores(gameOverScore: number): void {
    if (gameOverScore) {
      Storage.get({ key: this._highScoresKey }).then((data) => {
        if (data.value) {
          const scores: HighScore[] = JSON.parse(data.value);
          // add new element
          scores.push({ occurred: new Date(), score: gameOverScore });
          // sort by highest score
          scores.sort((a, b) => (a.score > b.score ? -1 : 1));
          // store only 3 highest scores
          this.storeScores(scores.slice(0, 3));
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
      Storage.get({ key: this._highScoresKey }).then((data) => {
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
    Storage.set({ key: this._highScoresKey, value: JSON.stringify(scores) });
  }
}
