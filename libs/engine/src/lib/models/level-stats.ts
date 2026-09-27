export interface LevelStats {
  fastestMatchTime: number;
  fastMatchBonusTotal: number;
  moveCount: number;
  moveCountEarned: number;
  pieceCount: number;
  perfectMatchBonus?: number;
}

export interface LevelCompleteShareData extends LevelStats {
  level: number;
  score: number;
}
