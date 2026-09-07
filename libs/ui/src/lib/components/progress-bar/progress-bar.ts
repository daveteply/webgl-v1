import { Component, input } from '@angular/core';
import { PercentPipe } from '@angular/common';

@Component({
  selector: 'wgl-progress-bar',
  imports: [PercentPipe],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
})
export class ProgressBar {
  value = input<number>(0);
  remaining = input<number>();
}
