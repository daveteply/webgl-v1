import { Texture } from 'three';
import { GamePieceMaterial } from './game-piece-material';

describe('GamePieceMaterial', () => {
  const mockMatchKey = 1;
  const mockTexture = new Texture();
  const mockBumpTexture = new Texture();
  const mockColor = 'blue';

  it('should create an instance', () => {
    expect(
      new GamePieceMaterial(
        mockMatchKey,
        mockTexture,
        mockBumpTexture,
        mockColor
      )
    ).toBeTruthy();
  });
});
