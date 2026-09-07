# WebGL-V1 (Rikkle) Project & DevContainer Rules

## DevContainer & Command Execution Policy

- All builds, tests, and dev-server commands must be executed within the DevContainer environment.
- When running commands via CLI, use `devcontainer exec --workspace-folder . <command>` (e.g. `devcontainer exec --workspace-folder . npm test`, `devcontainer exec --workspace-folder . nx build rikkle`, `devcontainer exec --workspace-folder . nx test engine`).

## Key Project Architecture & Rules

- **Nx Monorepo Structure**: Code is partitioned into domain libraries (`libs/engine`, `libs/graphics`, `libs/state`, `libs/audio`, `libs/ui`, `libs/shared`) and application shells (`apps/rikkle`, `apps/rikkle-e2e`).
- **Asset Routing**: All project assets (textures, particle graphics, fonts, audio) are located in `apps/rikkle/public`. In `apps/rikkle/project.json`, assets are configured to be served at `/assets/*` and `/`.
- **Lighting Model**: Three.js scenes use a front-facing `PointLight` (intensity 350, z = 5) paired with MeshPhongMaterial specular highlights and emissive accents to achieve vibrant contrast and well-lit geometry faces without requiring a global AmbientLight.
- **Color Management**: `ColorManagement.enabled` is `true` by default in Three.js. Avoid calling `.convertLinearToSRGB()` on `Color` hex instances to prevent double conversion.
- **State Synchronization**: `ObjectManagerService.LevelMaterialsUpdated` uses a `BehaviorSubject<boolean>` to prevent timing race conditions between texture loading and dialog component subscriptions.
