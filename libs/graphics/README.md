# @rikkle/graphics 🎨✨

Three.js 3D rendering pipeline, procedural materials, shader effects, and scene management for Rikkle.

## Overview

`@rikkle/graphics` encapsulates the entire WebGL rendering domain. It bridges the pure mathematical puzzle logic of `@rikkle/engine` with Three.js 3D meshes, custom bump/pattern/emoji canvas textures, lighting, particles, and post-processing.

## Key Subsystems

- **Game Engine & Scene Management (`game-engine.ts`, `scene-manager.ts`)**: Core game loop coordinator, camera setup, responsive FOV aspect ratio calculation, WebGLRenderer, and render loops.
- **Lighting Architecture**: Front-facing `PointLight` (intensity 350, z = 5) paired with `MeshPhongMaterial` specular highlights and emissive accents for high visual contrast without washing out the starfield background.
- **Post-Processing & Shaders (`post-processing-manager.ts`, `shockwave.shader.ts`, `tension.shader.ts`)**: EffectComposer pipeline featuring edge `OutlinePass`, SMAA anti-aliasing, radial bomb shockwave distortion, and low-move tension vignette shaders.
- **Object Management (`object-manager.ts`)**: Lifecycle of 3D `GameWheel` stacks and `GamePiece` objects (Cubes, Cylinders, Dodecahedrons) across vertical and horizontal orientations.
- **Procedural Textures & Materials**:
  - `material-manager.ts`: Generates specular Phong materials and dynamic bump maps.
  - `texture-manager.ts`: High-res procedural canvas rendering, 256x256 synchronous `CanvasTexture` emoji generation, and color schemes.
  - `emoji-support.ts`: Device canary version detection (Unicode 1.0–16.0) and missing-glyph/tofu filtering.
- **Effects & Particles (`effects-manager.ts`, `particle-emitter.ts`, `confetti-burst.ts`, `star-field.ts`)**: Spark particle bursts, confetti celebration bursts, dynamic gravity drop/implode/explode removal animations, and background starfields.
- **Interaction, Scoring & Persistence (`interaction-manager.ts`, `hints-manager.ts`, `scoring-manager.ts`, `save-game.ts`)**: Pointer/touch drag rotation, collision detection, animated hint highlights, match timer/score orchestration, and deterministic game state serialization.
- **Floating 3D Splash Text (`text-manager.ts`, `splash-text.ts`)**: In-situ 3D floating score bonuses and combo text with black outlines and multilingual CJK font switching (`NotoSansJP`).
- **Victory Card Social Sharing (`share-manager.ts`)**: High-DPI 2D canvas victory card generator with localized stats and Web Share API / clipboard integration.

## Testing & Linting

- **Test**: `npx nx test graphics`
- **Lint**: `npx nx lint graphics`
