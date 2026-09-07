import { LevelOrientationType } from '@rikkle/engine';

export interface SaveGameData {
  level: number;
  score: number;
  moves: number;
  seed: number;
  orientation?: LevelOrientationType;
  updatedAt?: number;
}
