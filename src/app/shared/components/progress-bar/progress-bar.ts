import { Component, Input } from '@angular/core';
import { PercentPipe } from '@angular/common';

@Component({
  selector: 'wgl-progress-bar',
  imports: [PercentPipe],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
})
export class ProgressBar {
  @Input() value!: number;
  @Input() remaining?: number;
}

export { ProgressBar as ProgressBarComponent };
