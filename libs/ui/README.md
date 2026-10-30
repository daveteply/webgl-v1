# @rikkle/ui 💎✨

Glassmorphic Angular UI components, Material dialogs, HUD controls, and overlay panels for Rikkle.

## Overview

`@rikkle/ui` contains all user interface presentation layers, built with modern CSS glassmorphism (`backdrop-filter: blur(12px)` with gradient borders), Angular Standalone Components, and Angular Material 3 tokens.

## Key UI Components & Dialogs

- **`GameContainer` (`game-container.ts`)**: Main game viewport host mounting the WebGL canvas, HUD overlays, and dialog subscriptions.
- **HUD Controls & Panels**:
  - `MovesLeft`: Displays remaining turns with animated color urgency state badges.
  - `ProgressBar`: Glassmorphic level progression indicator.
  - `GameMenu`: Glass action panel triggering user settings, level palette/emoji info (`About`), install prompts, and high scores.
  - `HighScores`: Leaderboard overview of top local scores and level milestones.
  - `ShareContent`: Social share trigger for exporting custom victory cards or game links.
- **Glassmorphic Dialogs**:
  - `Intro`: Welcome screen with high score overview, version badge (`APP_VERSION`), quick settings access, and game launch actions.
  - `LevelComplete`: Responsive victory panel calculating stats (speed bonus, piece clear counts, perfect match multiplier) with integrated victory card social sharing.
  - `GameOver`: Out-of-moves resolution dialog with retry flows, settings access, and leaderboard sync.
  - `UserSettings`: Tabbed preferences dialog featuring **General** settings (language selector for `en`/`es`/`de`/`fr`/`ja`, SFX/Music volume sliders, haptic feedback toggle) and **Game Data** management (tutorial hint reset/skip, high scores reset, and full factory reset).
  - `InstallPwa`: PWA installation call-to-action prompt.
  - `About`: Displays the active level's color scheme palette or emoji group, subgroups, and emoji descriptions.
- **Visual Overlays**:
  - `TextZoom` / `ZoomChar`: Animated typography zoom effect on match completions.
  - `TutorialOverlay`: Contextual touch/drag gesture tutorials for new mechanics.

## Testing & Linting

- **Test**: `npx nx test ui`
- **Lint**: `npx nx lint ui`
