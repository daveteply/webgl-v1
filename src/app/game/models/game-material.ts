import { Material } from 'three';

export interface GameMaterial {
  materialColorHex?: string;
  material: Material;
  matchKey: number;
}
