import { Font } from 'three/examples/jsm/loaders/FontLoader';
import { SplashText } from './splash-text';

describe('SplashText', () => {
  it('should create an instance', () => {
    expect(
      new SplashText(
        '0',
        new Font({
          glyphs: {
            '0': { ha: 780, x_min: 78, x_max: 701 },
          },
          boundingBox: {
            yMin: -376,
            xMin: -1023,
            yMax: 1467,
            xMax: 1595,
          },
        })
      )
    ).toBeTruthy();
  });
});
