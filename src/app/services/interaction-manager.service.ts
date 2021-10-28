import { Injectable } from '@angular/core';
import { ObjectManagerService } from './object-manager.service';
import 'hammerjs';
import * as THREE from 'three';
import { MathUtils } from 'three';

@Injectable({
  providedIn: 'root',
})
export class InteractionManagerService {
  private _hammer!: HammerManager;
  private _width!: number;
  private _theta: number = 0;
  private _x: number = 0;
  private _panning: boolean = false;

  constructor(private objectManager: ObjectManagerService) {}

  public InitInteractions(el: HTMLElement): void {
    this._hammer = new Hammer(el);

    this._hammer.on('pan', (panEvent) => {
      if (!this._panning) {
        this._panning = true;
      } else {
        const deltaX = panEvent.center.x - this._x;
        const normX = (panEvent.center.x / this._width) * 2;
        this._theta += MathUtils.degToRad(deltaX) * (75 / this._width) * -1;

        this.deviceScaleRotation(this._theta);
      }

      if (panEvent.isFinal) {
        this._panning = false;
      }

      this._x = panEvent.center.x;
    });

    // this._hammer.on('swipe', (swipeEvent) => {
    //   console.log('swipe', swipeEvent);
    // });

    // this._hammer.on('press', (pressEvent) => {
    //   console.log('press', pressEvent);
    // });
  }

  public UpdateWidth(width: number): void {
    this._width = width;
  }

  private deviceScaleRotation(theta: number) {
    this.objectManager.Rotate(theta);
  }
}
