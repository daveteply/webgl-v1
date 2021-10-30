import { MathUtils } from 'three';

export class RotateEase {
  private _currentTheta: number;
  private _targetTheta: number;
  private _steps: number[] = [];

  private _iterator: number = 0;

  constructor(currentTheta: number, targetTheta: number, steps: number) {
    this._currentTheta = currentTheta;
    this._targetTheta = targetTheta;

    // establish steps
    const inc = 1 / steps;
    for (let i = inc; i <= inc * steps; i += inc) {
      this._steps.push(
        MathUtils.lerp(this._currentTheta, this._targetTheta, i)
      );
    }
  }

  public get HasNext(): boolean {
    return !(this._iterator === this._steps.length);
  }

  public get Next(): number {
    return this._steps[this._iterator++];
  }
}
