import { Texture } from 'three';

export interface GamePieceMaterialData {
  MatchKey: number;
  Texture?: Texture;
  BumpTexture?: Texture;
  Color?: string;
}
