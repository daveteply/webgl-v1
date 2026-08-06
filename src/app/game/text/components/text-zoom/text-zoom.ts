import { Component, Input, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ZoomChar } from './zoom-char/zoom-char';

@Component({
  selector: 'wgl-text-zoom',
  providers: [DecimalPipe],
  imports: [ZoomChar],
  templateUrl: './text-zoom.html',
  styleUrl: './text-zoom.scss',
})
export class TextZoom {
  private decimalPipe = inject(DecimalPipe);

  chars: string[] = [];

  @Input() set text(target: number | string) {
    const formatted = Number(target) ? this.decimalPipe.transform(target) : target;
    if (formatted !== null && formatted !== undefined) {
      this.chars = formatted.toString().split('');
    }
  }
}

export { TextZoom as TextZoomComponent };
