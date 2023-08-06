import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { HighScore, HighScoreManagerService } from 'src/app/shared/services/high-score-manager.service';

@Component({
  selector: 'wgl-high-scores',
  standalone: true,
  imports: [CommonModule],
  providers: [DecimalPipe],
  templateUrl: './high-scores.component.html',
  styleUrls: ['./high-scores.component.scss'],
})
export class HighScoresComponent implements OnInit {
  constructor(private highScoreManager: HighScoreManagerService) {}

  highScores!: HighScore[];

  @Input() showHighligh = true;

  ngOnInit(): void {
    this.highScoreManager.GetHighScores().subscribe((highScores) => {
      this.highScores = highScores;
    });
  }
}
