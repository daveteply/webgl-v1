import { MeshPhongMaterial } from 'three';

export interface GameMaterial {
  materialColorHex: string;
  material: MeshPhongMaterial;
  matchKey: number;
}
