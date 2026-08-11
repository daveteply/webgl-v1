import { Component, input, signal, OnInit, inject } from '@angular/core';
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

  highScores = signal<HighScore[]>([]);
  showHighligh = input<boolean>(true);

  ngOnInit(): void {
    this.highScoreManager.GetHighScores().subscribe((highScores) => {
      this.highScores.set(highScores);
    });
  }
}

export { HighScores as HighScoresComponent };
