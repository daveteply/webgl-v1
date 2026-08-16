import { PRNG } from './prng';
import { arrayShuffle } from './array-shuffle';

describe('PRNG & Deterministic Utilities', () => {
  it('should generate identical float sequences for the same seed', () => {
    const rng1 = new PRNG(12345);
    const rng2 = new PRNG(12345);

    const seq1 = [rng1.next(), rng1.next(), rng1.next(), rng1.next()];
    const seq2 = [rng2.next(), rng2.next(), rng2.next(), rng2.next()];

    expect(seq1).toEqual(seq2);
    seq1.forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });
  });

  it('should generate different sequences for different seeds', () => {
    const rng1 = new PRNG(12345);
    const rng2 = new PRNG(54321);

    const seq1 = [rng1.next(), rng1.next(), rng1.next()];
    const seq2 = [rng2.next(), rng2.next(), rng2.next()];

    expect(seq1).not.toEqual(seq2);
  });

  it('should generate integers within the requested [min, max] range', () => {
    const rng = new PRNG(999);
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(3, 7);
      expect(val).toBeGreaterThanOrEqual(3);
      expect(val).toBeLessThanOrEqual(7);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('should generate positive 32-bit seeds from generateSeed()', () => {
    const seed = PRNG.generateSeed();
    expect(seed).toBeGreaterThan(0);
    expect(seed).toBeLessThanOrEqual(0x7fffffff);
    expect(Number.isInteger(seed)).toBe(true);
  });

  it('should deterministically shuffle arrays using PRNG', () => {
    const array = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig'];
    const rng1 = new PRNG(777);
    const rng2 = new PRNG(777);

    const shuffled1 = arrayShuffle(array, rng1);
    const shuffled2 = arrayShuffle(array, rng2);

    expect(shuffled1).toEqual(shuffled2);
    expect(shuffled1.length).toBe(array.length);
    expect(shuffled1.sort()).toEqual([...array].sort());
  });

  it('should fallback to Math.random if no PRNG is provided to arrayShuffle', () => {
    const array = [1, 2, 3, 4, 5];
    const shuffled = arrayShuffle(array);
    expect(shuffled.length).toBe(array.length);
    expect(shuffled.sort((a, b) => a - b)).toEqual(array);
  });
});
