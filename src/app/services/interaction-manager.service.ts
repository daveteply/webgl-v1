import { Injectable } from '@angular/core';
import { ObjectManagerService } from './object-manager.service';
import 'hammerjs';
import { MathUtils } from 'three';
import { GRID_ITERATION, ROTATIONAL_CONSTANT } from '../wgl-constants';
import { RotateEase } from '../models/rotate-ease';

@Injectable({
  providedIn: 'root',
})
export class InteractionManagerService {
  private _hammer!: HammerManager;
  private _width!: number;
  private _theta: number = 0;
  private _x: number = 0;
  private _panning: boolean = false;

  // establish single "step" around the radian circle
  private _gridInc: number = MathUtils.degToRad(GRID_ITERATION);

  constructor(private objectManager: ObjectManagerService) {}

  public InitInteractions(el: HTMLElement): void {
    this._hammer = new Hammer(el);

    this._hammer.on('pan', (panEvent) => {
      if (!this._panning) {
        this._panning = true;
      } else {
        this.deviceCordRotation(panEvent.center.x);
      }

      if (panEvent.isFinal) {
        this._panning = false;
        this.snapToGrid();
      }

      this._x = panEvent.center.x;
    });
  }

  public UpdateWidth(width: number): void {
    this._width = width;
  }

  private deviceCordRotation(x: number): void {
    const deltaX = x - this._x;
    this._theta +=
      MathUtils.degToRad(deltaX) * (ROTATIONAL_CONSTANT / this._width) * -1;

    // restart if full rotation
    if (Math.abs(this._theta) > 2 * Math.PI) {
      this._theta = 0;
    }

    this.objectManager.Rotate(this._theta);
  }

  private snapToGrid(): void {
    // find where the circle has "landed"
    const tier = Math.ceil(this._theta / this._gridInc);

    // calculate the next and previous "steps" of the snap grid
    const deltaNext = Math.abs(this._theta - tier * this._gridInc);
    const deltaPrev = Math.abs(this._theta - (tier - 1) * this._gridInc);

    // snap to grid
    const currentTheta = this._theta;
    if (deltaNext < deltaPrev) {
      this._theta += deltaNext;
    } else {
      this._theta -= deltaPrev;
    }

    this.objectManager.RotateEase(new RotateEase(currentTheta, this._theta, 5));
  }
}
