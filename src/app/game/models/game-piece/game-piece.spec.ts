import { GamePiece } from './game-piece';
import { GamePieceMaterialData } from './game-piece-material-data';

describe('GamePiece', () => {
  it('should create an instance', () => {
    const mockX = 0;
    const mockY = 0;
    const mockZ = 0;
    const mockRot = 0;
    const mockMaterialData: GamePieceMaterialData[] = [{ matchKey: 1 }];
    expect(new GamePiece(mockX, mockY, mockZ, mockRot)).toBeTruthy();
  });
});
