import { Betweener } from './betweener';

describe('Betweener', () => {
  const mockStart = 1.3;
  const mockEnd = 4.2;
  const mockSteps = 4;

  it('should create an instance', () => {
    expect(new Betweener(mockStart, mockEnd, mockSteps)).toBeTruthy();
  });
});
