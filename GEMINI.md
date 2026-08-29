# WebGL-V1 Project & DevContainer Rules

## DevContainer & Command Execution Policy

- All builds, tests, and dev-server commands must be executed within the DevContainer environment.
- When running commands via CLI, use `devcontainer exec --workspace-folder . <command>` (e.g. `devcontainer exec --workspace-folder . npm test` or `devcontainer exec --workspace-folder . ng build`).

## Key Project Architecture & Rules

- **Asset Routing**: All project assets (textures, particle graphics, fonts, audio) are located in `src/assets`. In `angular.json`, assets MUST be configured as `"src/assets"` so Angular CLI serves them at `/assets/*`.
- **Lighting Model**: Three.js scenes use a front-facing `PointLight` (intensity 350, z = 5) paired with MeshPhongMaterial specular highlights and emissive accents to achieve vibrant contrast and well-lit geometry faces without requiring a global AmbientLight.
- **Color Management**: `ColorManagement.enabled` is `true` by default in Three.js. Avoid calling `.convertLinearToSRGB()` on `Color` hex instances to prevent double conversion.
- **State Synchronization**: `ObjectManagerService.LevelMaterialsUpdated` uses a `BehaviorSubject<boolean>` to prevent timing race conditions between texture loading and dialog component subscriptions.
