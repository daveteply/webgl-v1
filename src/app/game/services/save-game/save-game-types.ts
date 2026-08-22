import { LevelOrientationType } from '../../models/level-orientation-type';

export interface SaveGameData {
  level: number;
  score: number;
  moves: number;
  seed: number;
  orientation?: LevelOrientationType;
  updatedAt?: number;
}
