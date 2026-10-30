# @rikkle/shared 🛠️📦

Cross-cutting utility functions, storage drivers, analytics, device sensors, and application services for Rikkle.

## Overview

`@rikkle/shared` provides services and utilities shared across the game libraries:

- **PRNG (`prng.ts`) & Shuffle (`array-shuffle.ts`)**: Deterministic pseudo-random number generator (Mulberry32) and Fisher-Yates array shuffling for reproducible procedural level generation and seed tracking.
- **Language & Localization (`language.service.ts`, `language.model.ts`)**: Multi-locale browser detection (`en`, `es`, `de`, `fr`, `ja`), persistent language selection, `Intl` number/date formatting, and `@jsverse/transloco` state synchronization.
- **Storage (`storage.service.ts`)**: Safe local storage abstraction with fallback mechanisms.
- **Analytics (`analytics-manager.ts`)**: Event tracking dispatcher supporting Mixpanel and telemetry.
- **Haptics (`haptics-manager.ts`)**: Web Vibration API integration for tactical tactile game feedback.
- **High Scores (`high-score-manager.ts`)**: Local and persistent leaderboard/high score persistence.
- **PWA Install (`pwa-install.ts`)**: Service worker and `beforeinstallprompt` lifecycle management.
- **App Visibility (`app-visibility.ts`)**: Page visibility monitoring for automatic pausing and background throttling.
- **Feature Flags (`feature-flags.service.ts`)**: Dynamic feature toggling, URL query overrides, console cheats (`window.rikkle`), and keyboard cheat sequences for testing gameplay modes (see [Feature Flags & Cheat Codes Guide](src/lib/services/feature-flags/README.md)).
- **Version Metadata (`version.ts`)**: Auto-generated `APP_VERSION` stamp updated at build/start time via `tools/set-version.js`.

## Testing & Linting

- **Test**: `npx nx test shared`
- **Lint**: `npx nx lint shared`
