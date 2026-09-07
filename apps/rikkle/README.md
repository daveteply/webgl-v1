# Rikkle Application Shell 🌐🎲

The main Angular 22 Progressive Web App (PWA) deployment shell for Rikkle.

## Overview

`apps/rikkle` is the top-level application container. It boots the Angular runtime, provides router outlets, establishes global styling tokens and font loading, registers service worker caching, and serves the static WebGL textures and audio files.

## Project Structure

- **`src/main.ts`**: Angular bootstrap entry point.
- **`src/app/`**: Root component (`app.ts`), lazy route configurations (`app.routes.ts`), and global error handling providers (`app.config.ts`).
- **`src/styles.scss` & `src/style-values.scss`**: Global SCSS reset, CSS custom properties, and glassmorphism styling tokens.
- **`public/`**: Web manifest (`manifest.webmanifest`), offline service worker (`sw.js`), app icons, splash screens, and audio/texture assets.

## Commands

- **Serve Dev**: `npx nx serve rikkle` (or `npm start`)
- **Build Production**: `npx nx build rikkle` (or `npm run build`)
- **Run Unit Tests**: `npx nx test rikkle`
- **Lint**: `npx nx lint rikkle`
