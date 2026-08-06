import { GamePiece } from './game-piece';

describe('GamePiece', () => {
  it('should create an instance', () => {
    expect(new GamePiece(0, 0, 0, 0)).toBeTruthy();
  });
});
