import { RotateEase } from './rotate-ease';

describe('RotateEase', () => {
  const mockStart = 1.3;
  const mockEnd = 4.2;
  const mockSteps = 4;

  it('should create an instance', () => {
    expect(new RotateEase(mockStart, mockEnd, mockSteps)).toBeTruthy();
  });
});
