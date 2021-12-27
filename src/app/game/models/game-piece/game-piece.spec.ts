import { GamePiece } from './game-piece';

describe('GamePiece', () => {
  it('should create an instance', () => {
    const mockX = 0;
    const mockY = 0;
    const mockZ = 0;
    const mockRot = 0;
    const mockMaterial = Object.assign({});
    expect(
      new GamePiece(mockX, mockY, mockZ, mockRot, mockMaterial)
    ).toBeTruthy();
  });
});
