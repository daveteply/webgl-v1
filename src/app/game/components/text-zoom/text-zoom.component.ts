import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'wgl-text-zoom',
  templateUrl: './text-zoom.component.html',
  styleUrls: ['./text-zoom.component.scss'],
})
export class TextZoomComponent {
  chars: string[] = [];

  @Input() set text(target: number | string) {
    const formatted = Number(target) ? this.decimalPipe.transform(target) : target;
    if (formatted) {
      this.chars = formatted.toString().split('');
    }
  }

  constructor(private decimalPipe: DecimalPipe) {}
}
