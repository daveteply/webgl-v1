/**
 * Pseudo-Random Number Generator based on the Mulberry32 32-bit algorithm.
 * Produces deterministic, uniform pseudo-random sequences for a given seed.
 *
 * Mulberry32 is lightweight, fast, and provides high-quality randomness
 * suitable for procedural generation, deterministic game boards, and replay systems.
 */
export class PRNG {
  private _state: number;
  private readonly _initialSeed: number;

  /**
   * Constructs a PRNG with the specified 32-bit integer seed.
   * @param seed 32-bit seed value (non-zero integer recommended).
   */
  constructor(seed: number) {
    this._initialSeed = seed;
    this._state = seed >>> 0;
  }

  /**
   * The original initial seed used to construct this PRNG instance.
   */
  get initialSeed(): number {
    return this._initialSeed;
  }

  /**
   * Generates a pseudo-random floating-point number in the range [0, 1).
   */
  public next(): number {
    let t = (this._state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates a pseudo-random integer in the range [min, max] inclusive.
   * @param min Minimum integer (inclusive).
   * @param max Maximum integer (inclusive).
   */
  public nextInt(min: number, max: number): number {
    const minCeil = Math.ceil(min);
    const maxFloor = Math.floor(max);
    return Math.floor(this.next() * (maxFloor - minCeil + 1)) + minCeil;
  }

  /**
   * Generates a random 32-bit positive integer seed suitable for seeding new game levels.
   */
  public static generateSeed(): number {
    return Math.floor(Math.random() * 0x7fffffff) + 1;
  }
}
