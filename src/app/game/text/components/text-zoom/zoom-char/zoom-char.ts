import { AfterViewInit, Component, ElementRef, input, OnDestroy, ViewChild } from '@angular/core';
import { Tween } from '@tweenjs/tween.js';
import { mainTweenGroup } from '../../../../services/tween-group';

@Component({
  selector: 'wgl-zoom-char',
  imports: [],
  templateUrl: './zoom-char.html',
  styleUrl: './zoom-char.scss',
})
export class ZoomChar implements AfterViewInit, OnDestroy {
  text = input<string>('');

  private _zoomTween?: Tween<Record<string, number>>;

  @ViewChild('charEl') localChar!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    const delta = { s: 10, o: 0.5 };
    const target = { s: 1, o: 1.0 };
    this._zoomTween = new Tween(delta, mainTweenGroup)
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
