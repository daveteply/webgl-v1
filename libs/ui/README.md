# @rikkle/ui 💎✨

Glassmorphic Angular UI components, Material dialogs, HUD controls, and overlay panels for Rikkle.

## Overview

`@rikkle/ui` contains all user interface presentation layers, built with modern CSS glassmorphism (`backdrop-filter: blur(12px)` with gradient borders), Angular Standalone Components, and Angular Material 3 tokens.

## Key UI Components & Dialogs

- **`GameContainer` (`game-container.ts`)**: Main game viewport host mounting the WebGL canvas, HUD overlays, and dialog subscriptions.
- **HUD Controls**:
  - `MovesLeft`: Displays remaining turns with animated color urgency state badges.
  - `HorizontalLevelNavigator`: Dynamic carousel allowing quick level navigation.
  - `ProgressBar`: Glassmorphic level progression indicator.
  - `GameMenu`: Glass action panel triggering user settings, install prompts, and high scores.
- **Glassmorphic Dialogs**:
  - `Intro`: Welcome screen with high score overview and starting tutorial.
  - `LevelComplete`: Responsive victory panel calculating stats (speed bonus, piece clear counts, perfect match multiplier).
  - `GameOver`: Out-of-moves resolution dialog with retry flows and leaderboard sync.
  - `UserSettings`: SFX / Music volume sliders and tactile haptic toggles.
  - `InstallPwa`: PWA installation call-to-action prompt.
- **Visual Overlays**:
  - `TextZoom` / `ZoomChar`: Animated typography zoom effect on match completions.
  - `TutorialOverlay`: Contextual touch/drag gesture tutorials for new mechanics.
  - `About`: Developer attribution, engine credits, and versioning info.

## Testing & Linting

- **Test**: `npx nx test ui`
- **Lint**: `npx nx lint ui`
