/**
 * Fisher-Yates (Knuth) Shuffle algorithm.
 * Returns a new shuffled copy of the array without mutating the original array.
 */
export function arrayShuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default arrayShuffle;
