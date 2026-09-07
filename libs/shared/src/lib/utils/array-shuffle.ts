import { PRNG } from './prng';

/**
 * Fisher-Yates (Knuth) Shuffle algorithm.
 * Returns a new shuffled copy of the array without mutating the original array.
 *
 * @param array Source array to shuffle.
 * @param rng Optional PRNG instance or random generator function in [0, 1). Defaults to Math.random.
 */
export function arrayShuffle<T>(array: readonly T[], rng?: PRNG | (() => number)): T[] {
  const getRandom = rng instanceof PRNG ? () => rng.next() : typeof rng === 'function' ? rng : Math.random;
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(getRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default arrayShuffle;
