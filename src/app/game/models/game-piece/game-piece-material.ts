import { Material, MeshBasicMaterial, MeshPhongMaterial, Texture } from 'three';

export class GamePieceMaterial {
  private _matchKey!: number;
  private _texture!: Texture;
  private _bumpTexture!: Texture;
  private _material!: Material;

  constructor(
    matchKey: number,
    texture?: Texture,
    bumpTexture?: Texture,
    color?: string
  ) {
    this._matchKey = matchKey;

    if (!bumpTexture && color) {
      this._material = new MeshPhongMaterial({
        color: color,
      });
    }

    if (bumpTexture && color) {
      this._material = new MeshPhongMaterial({
        color: color,
        bumpMap: bumpTexture,
        bumpScale: 0.03,
      });
    }

    if (texture) {
      this._material = new MeshBasicMaterial({
        map: texture,
      });
    }

    if (this._material) {
      this._material.transparent = true;
    }
  }

  get MatchKey(): number {
    return this._matchKey;
  }

  get Material(): Material {
    return this._material;
  }

  public Dispose(): void {
    this._texture?.dispose();
    this._material?.dispose();
  }
}
