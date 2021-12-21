import { MathUtils } from 'three';

export class Betweener {
  private _steps: number[] = [];
  private _iterator: number = 0;

  constructor(start: number, end: number, steps: number) {
    // establish steps
    const inc = 1 / steps;
    for (let i = inc; i <= inc * steps; i += inc) {
      this._steps.push(MathUtils.lerp(start, end, i));
    }

    // ensure final element is target theta
    this._steps[steps - 1] = end;
  }

  get HasNext(): boolean {
    return !(this._iterator === this._steps.length);
  }

  get Next(): number {
    return this._steps[this._iterator++];
  }
}
