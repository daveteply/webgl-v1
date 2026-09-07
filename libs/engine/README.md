# @rikkle/engine 🎲⚡

The pure TypeScript core game engine for Rikkle.

## Overview

`@rikkle/engine` houses the foundational rules, match resolution algorithms, gravity physics solvers, bomb blast calculators, and domain data models for the game. It is intentionally designed with **zero framework dependencies** (no Angular or Three.js imports) to enable:

- Ultra-fast headless unit testing
- Deterministic simulation and solver bots
- Reusability across web, mobile, CLI, or server environments

## Domain Structure

- **`algorithms/`**:
  - `match-finder.ts`: Linear and rotational matching algorithms across cylindrical wheel grids.
  - `bomb-target-finder.ts`: Radial neighborhood bomb blast calculations.
  - `gravity-solver.ts`: Vertical gravity resolution shifts (Down, Up, Mix).
- **`rules/`**:
  - `level-rules.ts`: Difficulty tier calculations, geometry types, and material progressions.
  - `power-move-rules.ts`: Power-up spawn probabilities and selection logic.
- **`models/`**: Domain interfaces and enums (`PieceNode`, `GravityAction`, `LevelStats`, etc.).
- **`utils/`**: Adapter utilities for converting Three.js grid representations into pure engine graph nodes.

## Testing & Linting

- **Test**: `npx nx test engine`
- **Lint**: `npx nx lint engine`
