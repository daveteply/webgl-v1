import { MeshBasicMaterial, MeshPhongMaterial } from 'three';

export interface PieceSideMaterial {
  matchKey: number;
  materialPhong: MeshPhongMaterial;
  materialBasic: MeshBasicMaterial;
  useBasic: boolean;
}

export interface PieceMaterials {
  materials: PieceSideMaterial[];
}

export interface WheelMaterial {
  pieceMaterials: PieceMaterials[];
}

export interface GameMaterials {
  wheelMaterials: WheelMaterial[];
}
