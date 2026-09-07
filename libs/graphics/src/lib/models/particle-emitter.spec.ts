import { ParticleEmitter } from './particle-emitter';

describe('ParticleEmitter', () => {
  it('should create an instance with default configuration', () => {
    const emitter = new ParticleEmitter();
    expect(emitter).toBeTruthy();
    expect(emitter.children.length).toBe(1);
    emitter.Dispose();
  });

  it('should accept custom configuration options', () => {
    const emitter = new ParticleEmitter({
      count: 20,
      size: 0.15,
      colors: [0xff0000, 0x00ff00],
      spread: 0.1,
      speed: 0.05,
      lifetime: 40,
    });
    expect(emitter).toBeTruthy();
    emitter.Dispose();
  });

  it('should update particle positions and colors without error', () => {
    const emitter = new ParticleEmitter({ count: 5, lifetime: 2 });
    expect(() => {
      emitter.Update();
      emitter.Update();
      emitter.Update();
    }).not.toThrow();
    emitter.Dispose();
  });

  it('should clean up resources on Dispose', () => {
    const emitter = new ParticleEmitter();
    expect(() => emitter.Dispose()).not.toThrow();
  });
});
