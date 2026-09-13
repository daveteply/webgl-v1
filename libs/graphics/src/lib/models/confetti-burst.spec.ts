import { ConfettiBurst } from './confetti-burst';

describe('ConfettiBurst', () => {
  it('should create an instance with default configuration', () => {
    const burst = new ConfettiBurst();
    expect(burst).toBeTruthy();
    expect(burst.children.length).toBe(1);
    expect(burst.renderOrder).toBe(999);
    burst.Dispose();
  });

  it('should accept array of colors or configuration options', () => {
    const burstWithColors = new ConfettiBurst([0xff0000, 0x00ff00]);
    expect(burstWithColors).toBeTruthy();
    burstWithColors.Dispose();

    const burstWithConfig = new ConfettiBurst(
      {
        count: 20,
        size: 0.15,
        colors: [0x00ffff, 0xff00ff],
        speed: 0.08,
        lifetime: 30,
      },
      1.2,
    );
    expect(burstWithConfig).toBeTruthy();
    burstWithConfig.Dispose();
  });

  it('should update particle physics and colors without error', () => {
    const burst = new ConfettiBurst({ count: 10, lifetime: 5 });
    expect(() => {
      burst.Update();
      burst.Update();
      burst.Update();
    }).not.toThrow();
    burst.Dispose();
  });

  it('should clean up resources on Dispose', () => {
    const burst = new ConfettiBurst();
    expect(() => burst.Dispose()).not.toThrow();
  });
});
