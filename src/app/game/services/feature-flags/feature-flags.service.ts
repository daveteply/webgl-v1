import { Injectable, signal, isDevMode } from '@angular/core';
import { LevelMaterialType } from '../../models/level-material-type';
import { LevelOrientationType } from '../../models/level-orientation-type';
import { LevelGeometryType } from '../../models/level-geometry-type';
import { GravityType } from '../../models/gravity-type';

export interface RikkleConsoleCheats {
  emoji: () => string;
  bumpshape: () => string;
  bumpmat: () => string;
  color: () => string;
  hright: () => string;
  hleft: () => string;
  vert: () => string;
  cube: () => string;
  cylinder: () => string;
  dodec: () => string;
  reset: () => string;
  status: () => Record<string, unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagsService {
  readonly materialOverride = signal<LevelMaterialType | null>(null);
  readonly orientationOverride = signal<LevelOrientationType | null>(null);
  readonly geometryOverride = signal<LevelGeometryType | null>(null);
  readonly gravityOverride = signal<GravityType | null>(null);

  private _typedBuffer = '';
  private _bufferTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.initFromUrlParams();
    this.initFromStorage();
    this.initConsoleCheatCodes();
    this.initKeyboardListener();
  }

  public SetMaterial(material: LevelMaterialType | null): void {
    this.materialOverride.set(material);
    this.persist('rikkle_ff_material', material !== null ? String(material) : null);
    this.logStatus();
  }

  public SetOrientation(orientation: LevelOrientationType | null): void {
    this.orientationOverride.set(orientation);
    this.persist('rikkle_ff_orientation', orientation !== null ? String(orientation) : null);
    this.logStatus();
  }

  public SetGeometry(geometry: LevelGeometryType | null): void {
    this.geometryOverride.set(geometry);
    this.persist('rikkle_ff_geometry', geometry !== null ? String(geometry) : null);
    this.logStatus();
  }

  public SetGravity(gravity: GravityType | null): void {
    this.gravityOverride.set(gravity);
    this.persist('rikkle_ff_gravity', gravity !== null ? String(gravity) : null);
    this.logStatus();
  }

  public Reset(): void {
    this.materialOverride.set(null);
    this.orientationOverride.set(null);
    this.geometryOverride.set(null);
    this.gravityOverride.set(null);
    try {
      sessionStorage.removeItem('rikkle_ff_material');
      sessionStorage.removeItem('rikkle_ff_orientation');
      sessionStorage.removeItem('rikkle_ff_geometry');
      sessionStorage.removeItem('rikkle_ff_gravity');
    } catch {
      // Ignore
    }
    console.info('🎮 [Rikkle Cheats] All feature flags and overrides reset to default gameplay.');
  }

  private initFromUrlParams(): void {
    try {
      if (typeof window === 'undefined' || !window.location) return;
      const params = new URLSearchParams(window.location.search);

      // Obscure cheat codes: ?cheat=emoji-hright, ?cheat=emoji, ?cheat=hleft, etc.
      const cheat = params.get('cheat')?.toLowerCase();
      if (cheat) {
        if (cheat.includes('emoji')) {
          this.materialOverride.set(LevelMaterialType.Emoji);
          this.geometryOverride.set(LevelGeometryType.Cube);
        }
        if (cheat.includes('bumpshape')) {
          this.materialOverride.set(LevelMaterialType.ColorBumpShape);
        }
        if (cheat.includes('bumpmat')) {
          this.materialOverride.set(LevelMaterialType.ColorBumpMaterial);
        }
        if (cheat.includes('color')) {
          this.materialOverride.set(LevelMaterialType.Color);
        }
        if (cheat.includes('hright')) {
          this.orientationOverride.set(LevelOrientationType.HorizontalRight);
        }
        if (cheat.includes('hleft')) {
          this.orientationOverride.set(LevelOrientationType.HorizontalLeft);
        }
        if (cheat.includes('vert')) {
          this.orientationOverride.set(LevelOrientationType.Vertical);
        }
        if (cheat.includes('cylinder')) {
          this.geometryOverride.set(LevelGeometryType.Cylinder);
        }
        if (cheat.includes('dodec')) {
          this.geometryOverride.set(LevelGeometryType.Dodecahedron);
        }
      }

      // Explicit granular flags: ?ff_mat=emoji, ?ff_orient=hright, etc.
      const ffMat = params.get('ff_mat')?.toLowerCase();
      if (ffMat === 'emoji') this.materialOverride.set(LevelMaterialType.Emoji);
      else if (ffMat === 'bumpshape') this.materialOverride.set(LevelMaterialType.ColorBumpShape);
      else if (ffMat === 'bumpmat') this.materialOverride.set(LevelMaterialType.ColorBumpMaterial);
      else if (ffMat === 'color') this.materialOverride.set(LevelMaterialType.Color);

      const ffOrient = params.get('ff_orient')?.toLowerCase();
      if (ffOrient === 'hright' || ffOrient === 'horizontal_right') {
        this.orientationOverride.set(LevelOrientationType.HorizontalRight);
      } else if (ffOrient === 'hleft' || ffOrient === 'horizontal_left') {
        this.orientationOverride.set(LevelOrientationType.HorizontalLeft);
      } else if (ffOrient === 'vert' || ffOrient === 'vertical') {
        this.orientationOverride.set(LevelOrientationType.Vertical);
      }
    } catch {
      // Ignore
    }
  }

  private initFromStorage(): void {
    try {
      if (typeof sessionStorage === 'undefined') return;
      const mat = sessionStorage.getItem('rikkle_ff_material');
      if (mat !== null) this.materialOverride.set(Number(mat));

      const orient = sessionStorage.getItem('rikkle_ff_orientation');
      if (orient !== null) this.orientationOverride.set(Number(orient));

      const geo = sessionStorage.getItem('rikkle_ff_geometry');
      if (geo !== null) this.geometryOverride.set(Number(geo));

      const grav = sessionStorage.getItem('rikkle_ff_gravity');
      if (grav !== null) this.gravityOverride.set(grav as GravityType);
    } catch {
      // Ignore
    }
  }

  private persist(key: string, value: string | null): void {
    try {
      if (typeof sessionStorage === 'undefined') return;
      if (value !== null) {
        sessionStorage.setItem(key, value);
      } else {
        sessionStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
  }

  private initConsoleCheatCodes(): void {
    try {
      if (typeof window === 'undefined') return;
      (window as unknown as Window & { rikkle?: RikkleConsoleCheats }).rikkle = {
        emoji: () => {
          this.SetMaterial(LevelMaterialType.Emoji);
          this.SetGeometry(LevelGeometryType.Cube);
          return '🎮 Material set to Emoji';
        },
        bumpshape: () => {
          this.SetMaterial(LevelMaterialType.ColorBumpShape);
          return '🎮 Material set to ColorBumpShape';
        },
        bumpmat: () => {
          this.SetMaterial(LevelMaterialType.ColorBumpMaterial);
          return '🎮 Material set to ColorBumpMaterial';
        },
        color: () => {
          this.SetMaterial(LevelMaterialType.Color);
          return '🎮 Material set to Color';
        },
        hright: () => {
          this.SetOrientation(LevelOrientationType.HorizontalRight);
          return '🎮 Orientation set to HorizontalRight';
        },
        hleft: () => {
          this.SetOrientation(LevelOrientationType.HorizontalLeft);
          return '🎮 Orientation set to HorizontalLeft';
        },
        vert: () => {
          this.SetOrientation(LevelOrientationType.Vertical);
          return '🎮 Orientation set to Vertical';
        },
        cube: () => {
          this.SetGeometry(LevelGeometryType.Cube);
          return '🎮 Geometry set to Cube';
        },
        cylinder: () => {
          this.SetGeometry(LevelGeometryType.Cylinder);
          return '🎮 Geometry set to Cylinder';
        },
        dodec: () => {
          this.SetGeometry(LevelGeometryType.Dodecahedron);
          return '🎮 Geometry set to Dodecahedron';
        },
        reset: () => {
          this.Reset();
          return '🎮 All overrides cleared';
        },
        status: () => {
          this.logStatus();
          return {
            material: this.materialOverride(),
            orientation: this.orientationOverride(),
            geometry: this.geometryOverride(),
            gravity: this.gravityOverride(),
          };
        },
      };
    } catch {
      // Ignore
    }
  }

  private initKeyboardListener(): void {
    try {
      if (typeof window === 'undefined') return;
      window.addEventListener('keydown', (e: KeyboardEvent) => {
        if (!e.key || e.key.length > 1) return;
        this._typedBuffer += e.key.toLowerCase();
        clearTimeout(this._bufferTimeout);
        this._bufferTimeout = setTimeout(() => {
          this._typedBuffer = '';
        }, 3000);

        if (this._typedBuffer.endsWith('rikkle-emoji')) {
          this.SetMaterial(LevelMaterialType.Emoji);
          this.SetGeometry(LevelGeometryType.Cube);
          this._typedBuffer = '';
        } else if (this._typedBuffer.endsWith('rikkle-hright')) {
          this.SetOrientation(LevelOrientationType.HorizontalRight);
          this._typedBuffer = '';
        } else if (this._typedBuffer.endsWith('rikkle-hleft')) {
          this.SetOrientation(LevelOrientationType.HorizontalLeft);
          this._typedBuffer = '';
        } else if (this._typedBuffer.endsWith('rikkle-reset')) {
          this.Reset();
          this._typedBuffer = '';
        }
      });
    } catch {
      // Ignore
    }
  }

  private logStatus(): void {
    if (isDevMode()) {
      console.info('🎮 [Rikkle Feature Flags / Cheats active]:', {
        material: this.materialOverride() !== null ? LevelMaterialType[this.materialOverride()!] : 'auto',
        orientation: this.orientationOverride() !== null ? LevelOrientationType[this.orientationOverride()!] : 'auto',
        geometry: this.geometryOverride() !== null ? LevelGeometryType[this.geometryOverride()!] : 'auto',
        gravity: this.gravityOverride() !== null ? this.gravityOverride() : 'auto',
      });
    }
  }
}
