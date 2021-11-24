import { MathUtils } from 'three';

export class PieceRemove {
  private _iterator: number = 0;
  private _limit: number;

  private _velocity: number;
  private _opacityRate: number;

  constructor(limit: number) {
    this._limit = limit;

    this._velocity = MathUtils.randFloat(0.04, 0.06);
    this._opacityRate = 1 / limit;
  }

  public Next(): void {
    this._iterator++;
  }

  get HasNext(): boolean {
    return !(this._iterator === this._limit);
  }

  get Velocity(): number {
    return this._velocity;
  }

  get OpacityRate(): number {
    return this._opacityRate;
  }
}
