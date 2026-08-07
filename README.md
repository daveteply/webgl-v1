# Rikkle 🎲✨

Welcome to the sights and sounds of Rikkle!

**Rikkle** is an immersive, web-based 3D cylindrical puzzle game powered by Angular 22, Three.js (WebGL), and the Web Audio API. Spin interlocking 3D wheels, align matching textures and geometries, trigger explosive power moves, and enjoy dynamic soundscapes as you climb through procedural difficulty levels.

🌐 **Play Rikkle now!** [https://rikkle.vercel.app](https://rikkle.vercel.app)

---

## 🎮 What is Rikkle?

Rikkle reimagines classic puzzle-matching mechanics into a full 3D experience. Players interact with a cylindrical grid composed of stacked, rotatable wheels containing colorful, textured pieces (cubes or cylinders). By aligning adjacent pieces of matching materials, patterns, or colors, players solve levels while managing limited moves and striving for high scores.

### Key Game Features & Mechanics

- 🔄 **3D Cylindrical Grid Gameplay**: Rotate individual wheels in 360° space to find and align matching game pieces.
- 🎨 **Procedural Materials & Geometries**: Levels alternate between cubic and cylindrical geometry types, accompanied by procedurally styled textures (Color, Bump, and Shape materials) and difficulty-tinted ambient starfield backdrops.
- 📈 **Dynamic Level Scaling**: Texture complexity ramps up from 6 base textures up to 9 as difficulty tiers increase, testing recognition and strategic move planning.
- ⚡ **Power Moves**: Unlock directional power-ups (Horizontal & Vertical Mix/Shift moves) to rearrange pieces and escape tight spots.
- 🎵 **Web Audio API Soundscape**: Features musical note scale escalation on long chain matches, directional match sounds, audio panic cues when low on moves, and randomized level music with independent SFX and Music volume controls.
- 💎 **Glassmorphic UI & Visual Polish**: Built with purple glassmorphic UI panels (`backdrop-filter` glass design), Three.js edge outline passes, smooth camera transition animations, and adaptive field-of-view scaling for mobile and desktop screens.
- 📱 **Progressive Web App (PWA)**: Full PWA support with service worker offline caching, responsive touch/drag controls, and instant installability.
- 💾 **State Persistence**: Automatic game saving and local high score tracking allow you to resume your game anytime.

---

## 🚀 Recent Updates & Improvements

- **Angular 22 & Three.js 0.185 Architecture**: Upgraded core engine dependencies to Angular 22 and Three.js 0.185 for enhanced performance and modern web standard compliance.
- **RikkleBacker Splash & Adaptive FOV**: Introduced an animated _RikkleBacker_ splash screen intro sequence and dynamic camera perspective adjustments tailored to device screen aspect ratios.
- **Enhanced Glassmorphic UI**: Redesigned UI dialogs, victory panels, and footer controls using modern CSS glassmorphism, responsive gap positioning, and mobile-friendly layouts.
- **Native Web Audio API Engine**: Rebuilt audio architecture utilizing native `AudioContext`, gain nodes, and buffer caching for seamless sound playback and background visibility management.
- **Expanded Test Suite**: Integrated Vitest unit testing and Playwright end-to-end (E2E) testing simulating full canvas dragging, wheel rotation, and level complete dialog flows.
- **PWA & Production Hosting**: Added full PWA web manifest, service worker setup, and automated deployment via Vercel.

---

## 💻 Developer Guide

Below is the technical documentation for building, running, and testing Rikkle locally.

### Tech Stack

- **Framework**: Angular 22 (Standalone components, Signals, RxJS)
- **3D Graphics Engine**: Three.js (WebGL rendering, custom shaders, PostProcessing outline passes)
- **Audio Engine**: Native Web Audio API
- **Styling**: Vanilla SCSS & Angular Material 3 with custom Glassmorphism tokens
- **Test Infrastructure**: Vitest (Unit/Integration) & Playwright (E2E)

### Development Server

To start a local development server:

```bash
ng serve
```

Or run with host binding:

```bash
npm start
```

Once the server is running, navigate to `http://localhost:4200/` in your browser. The application reloads automatically on source changes.

### Code Scaffolding

To generate new Angular components or services:

```bash
ng generate component component-name
```

For available schematics:

```bash
ng generate --help
```

### Building for Production

To build the production bundle:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Running Unit Tests

To execute unit tests with [Vitest](https://vitest.dev/):

```bash
npm test
```

To generate code coverage reports:

```bash
ng test --coverage
```

### Running End-to-End (E2E) Tests

End-to-end tests simulate real user interactions (canvas pointer dragging, wheel rotation, score updates, and dialog flows) using [Playwright](https://playwright.dev/):

```bash
# 1. Install Playwright browser binaries and system libraries (first time setup in running container):
npx playwright install --with-deps

# 2. Start dev server in container terminal:
npm start

# 3. In a separate terminal window inside DevContainer:
npx playwright test
```

### Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
