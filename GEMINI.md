# WebGL-V1 Project & DevContainer Rules

## DevContainer & Command Execution Policy
- All builds, tests, and dev-server commands must be executed within the DevContainer environment.
- When running commands via CLI, use `devcontainer exec --workspace-folder . <command>` (e.g. `devcontainer exec --workspace-folder . npm test` or `devcontainer exec --workspace-folder . ng build`).

## Key Project Architecture & Rules
- **Asset Routing**: All project assets (textures, particle graphics, fonts, audio) are located in `src/assets`. In `angular.json`, assets MUST be configured as `"src/assets"` so Angular CLI serves them at `/assets/*`.
- **Lighting Model**: Three.js uses physically-based lighting strictly. Scenes require an `AmbientLight` to avoid pitch-black unlit geometry faces.
- **Color Management**: `ColorManagement.enabled` is `true` by default in Three.js. Avoid calling `.convertLinearToSRGB()` on `Color` hex instances to prevent double conversion.
- **State Synchronization**: `ObjectManagerService.LevelMaterialsUpdated` uses a `BehaviorSubject<boolean>` to prevent timing race conditions between texture loading and dialog component subscriptions.
