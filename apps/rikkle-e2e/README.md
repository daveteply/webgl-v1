# Rikkle End-to-End Tests 🎭🕹️

Playwright automated browser test suite for Rikkle.

## Overview

`apps/rikkle-e2e` runs automated headless browser simulations validating end-to-end user journeys:

- WebGL canvas mounting and responsiveness
- Intro dialog dismissal and gameplay initiation
- Canvas pointer/mouse drag gestures and wheel rotation
- Game save state persistence in `localStorage`

## Commands

- **Run E2E Tests**: `npx nx e2e rikkle-e2e` (or `npm run e2e`)
