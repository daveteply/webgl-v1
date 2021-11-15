import { MathUtils } from 'three';

export class RotateEase {
  private _steps: number[] = [];
  private _iterator: number = 0;

  constructor(currentTheta: number, targetTheta: number, steps: number) {
    // establish steps
    const inc = 1 / steps;
    for (let i = inc; i <= inc * steps; i += inc) {
      this._steps.push(MathUtils.lerp(currentTheta, targetTheta, i));
    }

    // ensure final element is target theta
    this._steps[steps - 1] = targetTheta;
  }

  public get HasNext(): boolean {
    return !(this._iterator === this._steps.length);
  }

  public get Next(): number {
    return this._steps[this._iterator++];
  }
}
