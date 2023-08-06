import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { Tween } from '@tweenjs/tween.js';

@Component({
  selector: 'wgl-zoom-char',
  standalone: true,
  templateUrl: './zoom-char.component.html',
  styleUrls: ['./zoom-char.component.scss'],
})
export class ZoomCharComponent implements AfterViewInit, OnDestroy {
  char = '';

  private _zoomTween: any;

  @Input() set text(target: string) {
    this.char = target;
  }

  @ViewChild('charEl') localChar!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    const delta = { s: 10, o: 0.5 };
    const target = { s: 1, o: 1.0 };
    this._zoomTween = new Tween(delta)
      .to(target, 200)
      .onUpdate(() => {
        this.localChar.nativeElement.style.setProperty('transform', `scale(${delta.s})`);
        this.localChar.nativeElement.style.setProperty('opacity', delta.o + '');
      })
      .start();
  }

  ngOnDestroy(): void {
    this._zoomTween?.stop();
  }
}
