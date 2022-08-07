import { Component, OnInit } from '@angular/core';
import { HighScore, HighScoreManagerService } from 'src/app/shared/services/high-score-manager.service';

@Component({
  selector: 'wgl-high-scores',
  templateUrl: './high-scores.component.html',
  styleUrls: ['./high-scores.component.scss'],
})
export class HighScoresComponent implements OnInit {
  constructor(private highScoreManager: HighScoreManagerService) {}

  highScores!: HighScore[];

  ngOnInit(): void {
    this.highScoreManager.GetHighScores().subscribe((highScores) => {
      this.highScores = highScores;

      // hight light newest entry
      this.highScores.forEach((h) => (h.highlight = false));
      if (this.highScores.length > 1) {
        const newest = this.highScores.reduce((prev, current) => {
          return prev.occurred > current.occurred ? prev : current;
        });
        newest.highlight = true;
      }
    });
  }
}
