# @rikkle/shared 🛠️📦

Cross-cutting utility functions, storage drivers, analytics, device sensors, and application services for Rikkle.

## Overview

`@rikkle/shared` provides services and utilities shared across the game libraries:

- **PRNG (`prng.ts`)**: Deterministic pseudo-random number generator (Mulberry32) for reproducible procedural level generation and seed tracking.
- **Storage (`storage.service.ts`)**: Safe local storage abstraction with fallback mechanisms.
- **Analytics (`analytics-manager.ts`)**: Event tracking dispatcher supporting Mixpanel and telemetry.
- **Haptics (`haptics-manager.ts`)**: Web Vibration API integration for tactical tactile game feedback.
- **High Scores (`high-score-manager.ts`)**: Local and persistent leaderboard/high score persistence.
- **PWA Install (`pwa-install.ts`)**: Service worker and `beforeinstallprompt` lifecycle management.
- **App Visibility (`app-visibility.ts`)**: Page visibility monitoring for automatic pausing and background throttling.
- **Feature Flags (`feature-flags.service.ts`)**: Dynamic feature toggling for experimental gameplay modes.

## Testing & Linting

- **Test**: `npx nx test shared`
- **Lint**: `npx nx lint shared`
