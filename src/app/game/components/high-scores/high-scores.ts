import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { HighScore, HighScoreManagerService } from '../../../shared/services/high-score-manager';

@Component({
  selector: 'wgl-high-scores',
  imports: [CommonModule, DatePipe, DecimalPipe],
  providers: [DecimalPipe],
  templateUrl: './high-scores.html',
  styleUrl: './high-scores.scss',
})
export class HighScores implements OnInit {
  private highScoreManager = inject(HighScoreManagerService);

  highScores!: HighScore[];

  @Input() showHighligh = true;

  ngOnInit(): void {
    this.highScoreManager.GetHighScores().subscribe((highScores) => {
      this.highScores = highScores;
    });
  }
}

export { HighScores as HighScoresComponent };
