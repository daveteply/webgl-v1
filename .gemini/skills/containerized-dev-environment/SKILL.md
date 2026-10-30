---
name: containerized-dev-environment
description: Guidelines and environment instructions for running, serving, and building the webgl-v1 (Rikkle) Nx monorepo application inside Docker / DevContainer / WSL setup.
---

# DevContainer & Execution Guidelines

## Build & Shell Command Policy

- All builds, tests, and dev-server commands must be executed within the DevContainer environment.
- When running commands via CLI, use `devcontainer exec --workspace-folder . <command>` (e.g. `devcontainer exec --workspace-folder . npm test`, `devcontainer exec --workspace-folder . nx build rikkle`, `devcontainer exec --workspace-folder . nx test engine`).

## Environment Context

- **Workspace Architecture**: This repository is an **Nx Monorepo** running Angular v22 + Three.js v0.186 inside a DevContainer. Code is partitioned into domain libraries (`libs/engine`, `libs/graphics`, `libs/state`, `libs/audio`, `libs/ui`, `libs/shared`) and application shells (`apps/rikkle`, `apps/rikkle-e2e`).
- **Node.js Requirement**: The project requires **Node.js v22.x** and **npm v10.x** inside the container.

## Key Project Rules & Assets

- **Asset Routing**: All project assets (textures, particle graphics, fonts, audio, i18n JSON bundles, emoji dataset) are located in `apps/rikkle/public`. In `apps/rikkle/project.json`, assets are configured to be served at `/assets/*` and `/`.
- **Lighting Model**: Three.js scenes use a front-facing `PointLight` (intensity 350, z = 5) paired with `MeshPhongMaterial` specular highlights and emissive accents to achieve vibrant contrast and well-lit geometry faces without requiring a global `AmbientLight`.
- **Color Management**: `ColorManagement.enabled` is `true` by default in Three.js. Avoid calling `.convertLinearToSRGB()` on `Color` hex instances to prevent double conversion.
- **State Synchronization**: `ObjectManagerService.LevelMaterialsUpdated` uses a `BehaviorSubject<boolean>` to prevent timing race conditions between texture loading and dialog component subscriptions.
