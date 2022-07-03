import { Color, Texture } from 'three';

export interface GamePieceMaterialData {
  matchKey: number;
  texture?: Texture;
  bumpTexture?: Texture;
  colorStr?: string;
  color?: Color;
}
