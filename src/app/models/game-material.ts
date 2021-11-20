import { MeshStandardMaterial } from 'three';

export interface GameMaterial {
  materialColorHex: string;
  material: MeshStandardMaterial;
  matchKey: number;
}
