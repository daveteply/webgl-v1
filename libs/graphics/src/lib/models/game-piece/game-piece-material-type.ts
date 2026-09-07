import { Color } from 'three';
import { GameTexture } from '../../services/texture/game-texture';

export interface GamePieceMaterialData {
  matchKey: number;
  texture?: GameTexture;
  bumpTexture?: GameTexture;
  colorStr?: string;
  color?: Color;
}
