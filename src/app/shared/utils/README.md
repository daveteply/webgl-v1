# Shared Utilities: Procedural Generation & Randomness

This directory contains deterministic procedural generation utilities and helper functions used across the application.

## `PRNG` (`prng.ts`)

The `PRNG` class is an implementation of the **Mulberry32** pseudo-random number generator algorithm.

### Key Characteristics

- **Deterministic**: Given the same 32-bit initial integer `seed`, a `PRNG` instance produces the exact same sequence of values.
- **State Period**: $2^{32}$ distinct states, passing standard statistical randomness tests.
- **Lightweight**: Zero external dependencies, fast bitwise arithmetic.

### Usage

```typescript
import { PRNG } from './prng';

// Initialize with a seed
const rng = new PRNG(1849204);

// Generate floats in [0, 1)
const floatVal = rng.next();

// Generate integers in [min, max] inclusive
const roll = rng.nextInt(1, 6);

// Generate a new 32-bit positive seed for a new level
const newSeed = PRNG.generateSeed();
```

---

## `arrayShuffle` (`array-shuffle.ts`)

Implements the **Fisher-Yates (Knuth) Shuffle** algorithm. It creates a new shuffled shallow copy without mutating the source array.

### Deterministic Seeded Shuffle

Pass a `PRNG` instance as the second argument to deterministically shuffle arrays:

```typescript
import { arrayShuffle } from './array-shuffle';
import { PRNG } from './prng';

const rng = new PRNG(42);
const items = ['A', 'B', 'C', 'D', 'E'];

// Deterministic permutation
const shuffled = arrayShuffle(items, rng);
```
