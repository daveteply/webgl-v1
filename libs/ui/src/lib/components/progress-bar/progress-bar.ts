import { Component, input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'wgl-progress-bar',
  imports: [PercentPipe, TranslocoPipe],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
})
export class ProgressBar {
  value = input<number>(0);
  remaining = input<number>();
}
