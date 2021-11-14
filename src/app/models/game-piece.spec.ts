import { GamePiece } from './game-piece';

describe('GamePiece', () => {
  it('should create an instance', () => {
    const mockX = 0;
    const mockY = 0;
    const mockZ = 0;
    const mockRot = 0;
    expect(new GamePiece(mockX, mockY, mockZ, mockRot, [])).toBeTruthy();
  });
});
