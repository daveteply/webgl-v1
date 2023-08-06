import { GameWheel } from './game-wheel';

describe('GameWheel', () => {
  it('should create an instance', () => {
    const mockY = 0;
    expect(new GameWheel(mockY, [])).toBeTruthy();
  });
});
