import { LevelStats } from '../../models/level-stats';

export interface SaveMaterialData {
  matchKey: number;
  bumpSrc?: string;
  textureSrc?: string;
  colorStr?: string;
  emojiSequence?: string;
}

export interface SavePieceData {
  isRemoved: boolean;
  flipTurns: number;
  flipUp: boolean;
}

export interface SaveWheelData {
  theta: number;
  piecesData: SavePieceData[];
}

export interface SaveGameScore {
  stats: LevelStats;
  moves: number;
  remaining: number;
  progress: number;
  pieceTarget: number;
  score: number;
  level: number;
}

export interface SaveGameData {
  levelMaterialType?: number;
  levelGeometryType?: number;
  wheelData: SaveWheelData[];
  textureData: SaveMaterialData[];
  gameMaterials?: number[][][];
  scoring?: SaveGameScore;
  outlineColor?: number;
}
