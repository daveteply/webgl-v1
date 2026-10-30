# Rikkle 🎲✨

Welcome to the sights and sounds of Rikkle!

**Rikkle** is an immersive, web-based 3D cylindrical puzzle game powered by Angular 22, Three.js 0.186 (WebGL), and the Web Audio API, organized as an **Nx Monorepo**. Spin interlocking 3D wheels, align matching textures and geometries, trigger explosive power moves, and enjoy dynamic soundscapes as you climb through procedural difficulty levels.

🌐 **Play Rikkle now!** [https://rikkle.app](https://rikkle.app)

---

## 🎮 What is Rikkle?

Rikkle reimagines classic puzzle-matching mechanics into a full 3D experience. Players interact with a cylindrical grid composed of stacked, rotatable wheels containing colorful, textured pieces (cubes, cylinders, or dodecahedrons). By aligning adjacent pieces of matching materials, patterns, or colors, players solve levels while managing limited moves and striving for high scores.

### Key Game Features & Mechanics

- 🔄 **3D Cylindrical Grid Gameplay**: Rotate individual wheels in 360° space across vertical and horizontal cylinder orientations to find and align matching game pieces.
- 🎨 **Procedural Materials & Geometries**: Levels alternate between cubic, cylindrical, and dodecahedron geometry types, accompanied by procedurally styled materials (`ColorBumpShape`, `ColorBumpMaterial`, `Emoji`, and `Color`), device-aware Unicode 1.0–16.0 emoji profiling, and difficulty-tinted ambient starfield backdrops.
- 🌌 **Dynamic Gravity System**: Higher difficulty tiers introduce vertical gravity effects (Down, Up, or Mix) where remaining pieces fall or rise to fill cleared spaces and new pieces spawn dynamically.
- 💥 **Explosive Power Moves**: Unlock directional power-ups (Horizontal/Vertical Spins and Mix moves) as well as radial Bomb moves ("Kaboom!") with spark emitter particle effects to clear tight spots.
- ✨ **Dynamic Removal, Celebration & Transition Animations**: Multiple procedural piece removal effects (Fade, Implode/Pop, Explode/Scatter, Vortex/Spiral, Gravitational Drop), level transition styles (Radial Assemble, Spiral Vortex, Scatter Snap, Cascade Wave), confetti burst celebrations, and in-situ 3D floating reward text with black outlines.
- 📈 **Dynamic Level Scaling**: Texture complexity ramps up from 6 base textures up to 9 as difficulty tiers increase, testing recognition and strategic move planning.
- 🌐 **Multi-Language Localization (i18n)**: Localized in English, German, Spanish, French, and Japanese via `@jsverse/transloco` with automatic browser locale detection, locale-aware number/date formatting, and multilingual 3D WebGL splash typography (`NotoSansJP`).
- 🏆 **Social Victory Card Sharing**: Generate and share custom high-DPI canvas victory cards featuring level statistics and randomized localized social text via the Web Share API or clipboard/image download fallbacks.
- 🎵 **Web Audio API Soundscape & Haptics**: Features musical note scale escalation on long chain matches, directional match sounds, audio panic cues when low on moves, haptic feedback pulses on mobile, and randomized level music with independent SFX and Music volume controls.
- 💎 **Glassmorphic UI & Visual Polish**: Built with purple glassmorphic UI panels (`backdrop-filter` glass design), Three.js edge outline and custom shockwave/tension post-processing passes, smooth camera transition animations, tabbed user settings, and adaptive field-of-view scaling for mobile and desktop screens.
- 📱 **Progressive Web App (PWA)**: Full PWA support with service worker offline caching, responsive touch/drag controls, and instant installability.
- 💾 **State Persistence**: Automatic game saving and local high score tracking allow you to resume your game anytime using deterministic PRNG seeds.

---

## 🏛️ Monorepo Architecture

Rikkle is structured as an **Nx Monorepo** partitioned into focused libraries and application shells:

```
webgl-v1/
├── apps/
│   ├── rikkle/                  # Angular 22 PWA Application Shell
│   └── rikkle-e2e/              # Playwright End-to-End Test Suite
│
├── libs/
│   ├── engine/                  # Pure TS Game Engine, Match & Gravity Solvers, Rules
│   ├── shared/                  # PRNG, Storage, Analytics, Haptics, Feature Flags
│   ├── audio/                   # Web Audio API Synth, Soundscapes, Gain Nodes
│   ├── state/                   # Angular Signals GameStateStore & State Machine
│   ├── graphics/                # Three.js 3D WebGL Rendering, Shaders, Particles
│   └── ui/                      # Glassmorphic UI Components, Dialogs, HUD Controls
```

### Domain Documentation

For detailed architectural and API documentation for each domain, explore their respective guides:

- 🎲 [**@rikkle/engine**](libs/engine/README.md): Pure TypeScript match-finding, gravity resolution, and rules engine (zero framework dependencies).
- 🛠️ [**@rikkle/shared**](libs/shared/README.md): Deterministic PRNG (Mulberry32), i18n language service, persistent storage, telemetry, feature flags, and device sensor integrations.
- 🎵 [**@rikkle/audio**](libs/audio/README.md): Native Web Audio API soundscape, tone generator, pitch escalations, and volume controls.
- ⚡ [**@rikkle/state**](libs/state/README.md): Angular Signals reactive store managing score, progression, and game state transitions.
- 🎨 [**@rikkle/graphics**](libs/graphics/README.md): Three.js WebGL scene, lighting model, post-processing shaders, victory card sharing, and procedural canvas textures.
- 💎 [**@rikkle/ui**](libs/ui/README.md): Glassmorphic HUD, Angular Material 3 dialogs, tabbed user settings, and game controls.
- 🌐 [**apps/rikkle**](apps/rikkle/README.md): Root Angular 22 PWA deployment shell, localization bundles, and assets.
- 🎭 [**apps/rikkle-e2e**](apps/rikkle-e2e/README.md): Playwright test suite for canvas dragging and game loop validation.
- 🕹️ [**Feature Flags & Cheat Codes**](libs/shared/src/lib/services/feature-flags/README.md): Developer URL parameters, console helpers (`window.rikkle`), and keyboard overrides for testing specific level configurations.

---

## 💻 Developer Guide

### Prerequisites

- Node.js `22.x` & npm `10.x` (or DevContainer environment)
- Playwright system dependencies (installed automatically in DevContainer)

### Development Server

To start the local development server:

```bash
npm start
# or
npx nx serve rikkle
```

Navigate to `http://localhost:4200/` in your browser. The application reloads automatically on source changes.

### Running Unit Tests

Run all unit tests across all libraries and applications via Vitest:

```bash
npm test
# or
npx nx run-many -t test
```

To run unit tests for a specific domain library:

```bash
npx nx test engine
npx nx test graphics
npx nx test state
npx nx test audio
npx nx test ui
npx nx test shared
```

### Linting & Architectural Boundary Checks

Execute ESLint with `@nx/enforce-module-boundaries` checks:

```bash
npm run lint
# or
npx nx run-many -t lint
```

### Building for Production

To build the production bundle:

```bash
npm run build
# or
npx nx build rikkle
```

Production build artifacts are emitted to `dist/apps/rikkle/browser`.

### Running End-to-End (E2E) Tests

Execute headless Playwright E2E browser tests:

```bash
npm run e2e
# or
npx nx e2e rikkle-e2e
```

### Visualizing Project Graph

To view the interactive dependency graph of apps and libraries:

```bash
npm run graph
# or
npx nx graph
```

### Formatting & Tooling Scripts

Format workspace files with Prettier or refresh the Unicode emoji dataset:

```bash
npm run format
npm run update-emoji
```
