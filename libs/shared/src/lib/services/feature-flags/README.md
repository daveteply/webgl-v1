# Rikkle Developer Feature Flags & Cheat Codes

The `FeatureFlagsService` enables quick testing and debugging of specific game modes, materials, geometries, orientations, and gravity rules without waiting for RNG rolls or progressing through multiple levels.

---

## 🎯 Gameplay Rules & Constraints

In standard player progression:

- **Horizontal Levels** are constrained to `ColorBumpShape`, `Color`, and `ColorBumpMaterial` (emojis are vertical-only).
- **Dodecahedron Levels** are constrained to `ColorBumpShape`, `Color`, and `ColorBumpMaterial`.
- **Developer Cheats / Feature Flags** allow testing any combination (including forcing emoji on horizontal levels if desired).

---

## 🎮 How to Use

### 1. URL Query Parameters

Append cheat flags directly to the browser URL (e.g. `http://localhost:4200/?cheat=emoji-hright`):

| Parameter             | Effect                                                                 |
| :-------------------- | :--------------------------------------------------------------------- |
| `?cheat=emoji-hright` | Forces **Emoji** material on **Horizontal Right** cylinder orientation |
| `?cheat=emoji-hleft`  | Forces **Emoji** material on **Horizontal Left** cylinder orientation  |
| `?cheat=emoji`        | Forces **Emoji** material on all levels                                |
| `?cheat=bumpshape`    | Forces **ColorBumpShape** (geometric shapes)                           |
| `?cheat=bumpmat`      | Forces **ColorBumpMaterial** (surface bump patterns)                   |
| `?cheat=color`        | Forces pure **Color** material                                         |
| `?cheat=hright`       | Forces **Horizontal Right** orientation                                |
| `?cheat=hleft`        | Forces **Horizontal Left** orientation                                 |
| `?cheat=vert`         | Forces **Vertical** orientation                                        |
| `?cheat=cylinder`     | Forces **Cylinder** piece geometry                                     |
| `?cheat=dodec`        | Forces **Dodecahedron** piece geometry                                 |
| `?cheat=cube`         | Forces **Cube** piece geometry                                         |

#### Granular Parameters

- `?ff_mat=emoji` | `bumpshape` | `bumpmat` | `color`
- `?ff_orient=hright` | `hleft` | `vert`
- `?ff_geo=cube` | `cylinder` | `dodec`

---

### 2. Browser DevTools Console (`window.rikkle`)

Open Developer Tools (`F12` or `Ctrl+Shift+I` / `Cmd+Option+I`) and call:

```javascript
// Material Overrides
rikkle.emoji(); // Force Emoji levels
rikkle.bumpshape(); // Force ColorBumpShape
rikkle.bumpmat(); // Force ColorBumpMaterial
rikkle.color(); // Force Color

// Orientation Overrides
rikkle.hright(); // Force Horizontal Right (90° clockwise)
rikkle.hleft(); // Force Horizontal Left (90° counter-clockwise)
rikkle.vert(); // Force Vertical orientation

// Geometry Overrides
rikkle.cube(); // Force Cube geometry
rikkle.cylinder(); // Force Cylinder geometry
rikkle.dodec(); // Force Dodecahedron geometry

// Utilities
rikkle.status(); // Inspect active flags and overrides
rikkle.reset(); // Clear all overrides and restore default RNG
```

Overrides set via console persist in the current browser tab session (`sessionStorage`).

---

### 3. In-Game Keyboard Cheat Codes

Type these secret letter sequences anywhere on the keyboard during gameplay:

- **`rikkle-emoji`** $\rightarrow$ Activates Emoji mode
- **`rikkle-hright`** $\rightarrow$ Activates Horizontal Right mode
- **`rikkle-hleft`** $\rightarrow$ Activates Horizontal Left mode
- **`rikkle-reset`** $\rightarrow$ Clears all active overrides
