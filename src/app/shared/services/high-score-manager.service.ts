import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';

interface highScore {
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
          const scores: highScore[] = JSON.parse(data.value);
          // add new element
          scores.push({ occurred: new Date(), score: gameOverScore });
          // sort by highest score
          scores.sort((a, b) => (a.score > b.score ? -1 : 1));
          // store only 3 highest scores
          this.storeScores(scores.slice(0, 3));
        } else {
          const scores: highScore[] = [];
          scores.push({ occurred: new Date(), score: gameOverScore });
          this.storeScores(scores);
        }
      });
    }
  }

  private storeScores(scores: highScore[]): void {
    Storage.set({ key: this._highScoresKey, value: JSON.stringify(scores) });
  }
}
