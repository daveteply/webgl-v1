import { Component, input, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighScore, HighScoreManagerService, LanguageService } from '@rikkle/shared';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'wgl-high-scores',
  imports: [CommonModule, TranslocoPipe],
  templateUrl: './high-scores.html',
  styleUrl: './high-scores.scss',
})
export class HighScores implements OnInit {
  public languageService = inject(LanguageService);
  private highScoreManager = inject(HighScoreManagerService);

  highScores = signal<HighScore[]>([]);
  showHighligh = input<boolean>(true);

  ngOnInit(): void {
    this.highScoreManager.GetHighScores().subscribe((highScores) => {
      this.highScores.set(highScores);
    });
  }
}
