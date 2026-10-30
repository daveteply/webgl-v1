# @rikkle/state ⚡📊

Reactive game state management powered by Angular Signals for Rikkle.

## Overview

`@rikkle/state` contains `GameStateStore`, the single source of truth for runtime gameplay data. It exposes fine-grained Angular signals (`signal`, `computed`) for frictionless reactivity without zone overhead or manual subscription tracking.

## Managed State Signals

- **`score`**: Cumulative gameplay score with combo multipliers and speed bonuses.
- **`movesRemaining` & `movesStatus`**: Move countdown with computed warning, danger, and panic status (`'normal' | 'warn' | 'danger' | 'panic'`).
- **`level`, `levelProgress`, `levelPieceTarget`, & `piecesRemaining`**: Current level index, target piece count, remaining pieces, and completion percentage.
- **`gameStatus`**: High-level state machine (`'idle' | 'playing' | 'paused' | 'level-complete' | 'game-over'`), paired with computed `isLevelComplete` and `isGameOver` flags.
- **Level Configuration Signals**: `levelGeometryType`, `levelMaterialType`, `gravityType`, `levelOrientation` (and computed `isHorizontal`), and `levelTransitionType`.
- **Theme & Appearance Signals**: `levelColors`, `levelColorScheme`, and `emojiInfo` for active level palette and emoji metadata.
- **`levelStats`**: Move counts, earned moves, fastest match times, fast match bonus totals, perfect match bonuses, and cleared piece counts.

## Testing & Linting

- **Test**: `npx nx test state`
- **Lint**: `npx nx lint state`
