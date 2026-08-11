import { Component, computed, input, inject } from '@angular/core';
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

  text = input<number | string>('');

  chars = computed<string[]>(() => {
    const target = this.text();
    const formatted = Number(target) ? this.decimalPipe.transform(target) : target;
    if (formatted !== null && formatted !== undefined) {
      return formatted.toString().split('');
    }
    return [];
  });
}

export { TextZoom as TextZoomComponent };
