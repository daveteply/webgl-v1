import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ZoomCharComponent } from './zoom-char/zoom-char.component';

@Component({
  selector: 'wgl-text-zoom',
  standalone: true,
  imports: [CommonModule, ZoomCharComponent],
  templateUrl: './text-zoom.component.html',
  styleUrls: ['./text-zoom.component.scss'],
})
export class TextZoomComponent {
  chars: string[] = [];

  @Input() set text(target: number | string) {
    const formatted = Number(target) ? this.decimalPipe.transform(target) : target;
    if (formatted !== null) {
      this.chars = formatted.toString().split('');
    }
  }

  constructor(private decimalPipe: DecimalPipe) {}
}
