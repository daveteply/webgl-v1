# @rikkle/state ⚡📊

Reactive game state management powered by Angular Signals for Rikkle.

## Overview

`@rikkle/state` contains `GameStateStore`, the single source of truth for runtime gameplay data. It exposes fine-grained Angular signals (`signal`, `computed`) for frictionless reactivity without zone overhead or manual subscription tracking.

## Managed State Signals

- **`score`**: Cumulative gameplay score with combo multipliers and speed bonuses.
- **`movesRemaining`**: Move countdown with danger and panic state computation.
- **`level` & `levelProgress`**: Current level index and percentage of target matches completed.
- **`gameStatus`**: High-level state machine (`Playing`, `Paused`, `LevelComplete`, `GameOver`).
- **`levelConfiguration`**: Active geometry type, material style, vertical/horizontal orientation, and gravity mode.
- **`levelStats`**: Move counts, fastest match times, perfect match bonuses, and piece statistics.

## Testing & Linting

- **Test**: `npx nx test state`
- **Lint**: `npx nx lint state`
