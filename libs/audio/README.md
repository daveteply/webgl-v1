# @rikkle/audio 🎵🔊

Native Web Audio API soundscape, tone generator, and audio manager for Rikkle.

## Overview

`@rikkle/audio` controls all acoustic elements in the game using native `AudioContext`, gain nodes, and cached audio buffers.

## Key Capabilities

- **Musical Scale Escalation**: On multi-match and long combos, plays dynamic musical note scales with rising pitch.
- **Directional Match Cues**: Plays distinct audio frequencies for horizontal vs. vertical line completions.
- **Low-Move Panic Sound**: Loopable pulsing tension cues when remaining moves drop below danger thresholds.
- **Independent Channels**: Dual master gain node routing for independent SFX and Background Music volume sliders.
- **Lifecycle Management**: Auto-suspends and resumes audio context when switching browser tabs via `AppVisibilityService`.

## Testing & Linting

- **Test**: `npx nx test audio`
- **Lint**: `npx nx lint audio`
