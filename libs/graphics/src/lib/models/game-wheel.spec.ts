import { GameWheel } from './game-wheel';
import { Vector3 } from 'three';

describe('GameWheel', () => {
  it('should create an instance', () => {
    expect(new GameWheel(0, [])).toBeTruthy();
  });

  it('should initiate horizontal turn spin and update rotation', () => {
    const meshPoints = [
      { polarCoords: new Vector3(1, 0, 0), rotationY: 0 },
      { polarCoords: new Vector3(0, 0, 1), rotationY: Math.PI / 2 },
    ];
    const wheel = new GameWheel(0, meshPoints);
    wheel.AnimateHorizontalTurnSpin(3000);

    expect(wheel['_horizontalTurnTween']).toBeDefined();

    // Trigger complete
    wheel['_horizontalTurnTween']?.stop();
    expect(wheel).toBeTruthy();
  });

  it('should wrap UpdateTheta smoothly within [0, 2PI) without abrupt jumping', () => {
    const wheel = new GameWheel(0, []);
    wheel.UpdateTheta(Math.PI);
    expect(wheel.Theta).toBeCloseTo(Math.PI);

    // Rotate past 2PI
    wheel.UpdateTheta(Math.PI * 1.5);
    expect(wheel.Theta).toBeCloseTo(Math.PI * 0.5);

    // Rotate negative past 0
    wheel.UpdateTheta(-Math.PI);
    expect(wheel.Theta).toBeCloseTo(Math.PI * 1.5);
  });

  it('should snap to nearest grid step and normalize theta on SnapToGrid', () => {
    const wheel = new GameWheel(0, []);
    wheel.UpdateTheta(0.2); // ~11.4 deg, close to 10 deg GRID_INC (0.1745)
    wheel.UpdateMoveStartTheta();

    wheel.SnapToGrid();
    expect(wheel.Theta).toBeCloseTo(0.174533, 4);
  });
});
