# @rikkle/graphics 🎨✨

Three.js 3D rendering pipeline, procedural materials, shader effects, and scene management for Rikkle.

## Overview

`@rikkle/graphics` encapsulates the entire WebGL rendering domain. It bridges the pure mathematical puzzle logic of `@rikkle/engine` with Three.js 3D meshes, custom bump/pattern/emoji canvas textures, lighting, particles, and post-processing.

## Key Subsystems

- **Scene Management (`scene-manager.ts`)**: Camera setup, responsive FOV aspect ratio calculation, WebGLRenderer, render loops, and post-processing `OutlinePass`.
- **Lighting Architecture**: Front-facing `PointLight` (intensity 350, z = 5) paired with `MeshPhongMaterial` specular highlights and emissive accents for high visual contrast without washing out the starfield background.
- **Object Management (`object-manager.ts`)**: Lifecycle of 3D `GameWheel` stacks and `GamePiece` objects (Cubes, Cylinders, Dodecahedrons).
- **Procedural Textures & Materials**:
  - `material-manager.ts`: Generates specular Phong materials and dynamic bump maps.
  - `texture-manager.ts`: High-res procedural canvas rendering, emoji composite sheets, and color schemes.
- **Effects & Particles (`effects-manager.ts`, `particle-emitter.ts`, `star-field.ts`)**: Spark particle bursts, dynamic gravity drop/implode/explode removal animations, and background starfields.
- **Interaction & Raycasting (`interaction-manager.ts`, `hints-manager.ts`)**: Pointer/touch drag rotation, collision detection, and animated hint highlights.
- **Floating Splash Text (`text-manager.ts`, `splash-text.ts`)**: 3D in-scene floating score bonuses and combo text.

## Testing & Linting

- **Test**: `npx nx test graphics`
- **Lint**: `npx nx lint graphics`
