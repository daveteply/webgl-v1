import { DOCUMENT } from '@angular/common';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import {
  LAYOUT_ASPECT,
  LAYOUT_CLIENT_HEIGHT_PERCENT,
  LAYOUT_HEADER_OFFSET,
  LAYOUT_MIN_WIDTH,
} from 'src/app/game/game-constants';

@Injectable({
  providedIn: 'root',
})
export class LayoutManagerService {
  private _targetHeight: number = 0;
  get Height(): number {
    return this._targetHeight;
  }

  private _targetWidth: number = 0;
  get Width(): number {
    return this._targetWidth;
  }

  private _gridTemplateColumns: string = '';
  get GridTemplateColumns(): string {
    return this._gridTemplateColumns;
  }

  private _gridTemplateRows: string = '';
  get GridTemplateRows(): string {
    return this._gridTemplateRows;
  }

  private _resizeObservable: Observable<Event> = fromEvent(window, 'resize');
  private _resizeSubscription: Subscription;

  OnResize: EventEmitter<void> = new EventEmitter();

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.updateSize(this.document.defaultView?.innerWidth || 0, this.document.defaultView?.innerHeight || 0);

    this._resizeSubscription = this._resizeObservable.subscribe((resizeEvent) => {
      const win = resizeEvent.target as Window;
      this.updateSize(win.innerWidth, win.innerHeight);
    });
  }

  OnDestroy(): void {
    this._resizeSubscription.unsubscribe();
  }

  private updateSize(viewportWidth: number, viewportHeight: number): void {
    this._targetHeight = Math.ceil((viewportHeight - LAYOUT_HEADER_OFFSET) * LAYOUT_CLIENT_HEIGHT_PERCENT);
    this._targetWidth = Math.ceil(this._targetHeight * LAYOUT_ASPECT);

    // re-scale if device is very narrow
    if (this._targetWidth >= viewportWidth) {
      this._targetHeight = (viewportWidth * this._targetHeight) / this._targetWidth;
      this._targetWidth = viewportWidth;
    }

    // set grid styles
    if (viewportWidth >= LAYOUT_MIN_WIDTH) {
      this._gridTemplateColumns = `1fr ${this._targetWidth}px 1fr`;
      this._gridTemplateRows = '';
    } else {
      this._gridTemplateColumns = '';
      this._gridTemplateRows = `1fr ${this._targetHeight}px 1fr`;
    }

    this.OnResize.next();
  }
}
