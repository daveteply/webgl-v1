import { MathUtils, Vector3 } from 'three';

export class PieceRemove {
  private _iterator: number = 0;
  private _limit: number;

  private _opacityRate: number;
  private _velocity: number;
  private _tumble: Vector3;

  constructor(limit: number) {
    this._limit = limit;

    this._opacityRate = 1 / limit;
    this._velocity = MathUtils.randFloat(0.02, 0.46);
    this._tumble = new Vector3(
      MathUtils.randFloat(-0.06, 0.06),
      MathUtils.randFloat(-0.06, 0.06),
      MathUtils.randFloat(-0.06, 0.06)
    );
  }

  public Next(): void {
    this._iterator++;
  }

  get HasNext(): boolean {
    return !(this._iterator === this._limit);
  }

  get OpacityRate(): number {
    return this._opacityRate;
  }

  get Velocity(): number {
    return this._velocity;
  }

  get Tumble(): Vector3 {
    return this._tumble;
  }
}
