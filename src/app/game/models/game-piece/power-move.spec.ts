import { Texture } from 'three';
import { PowerMove } from './power-move';

describe('PowerMove', () => {
  it('should create an instance', () => {
    expect(new PowerMove(new Texture())).toBeTruthy();
  });
});
