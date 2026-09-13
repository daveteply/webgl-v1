import { Injectable } from '@angular/core';

import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { Group, LoadingManager, MathUtils, PerspectiveCamera, Scene, Vector3 } from 'three';
import { SplashMotionStyle, SplashText, SplashTextOptions } from './splash-text';
import { TextSplashEventType } from './text-splash-event-type';

@Injectable({
  providedIn: 'root',
})
export class TextManagerService {
  private _loadingManager: LoadingManager;
  private _fontLoader: FontLoader;

  private _changaRegular!: Font;

  private _scene!: Scene;
  private _camera?: PerspectiveCamera;

  private _queue: SplashText[] = [];
  private _textGroup!: Group;
  private _inSituContainer!: Group;

  private _recentInSituSpawns: { pos: Vector3; time: number }[] = [];

  private _isPresenting = false;

  constructor() {
    this._loadingManager = new LoadingManager();
    this._fontLoader = new FontLoader(this._loadingManager);
  }

  public SetCamera(camera: PerspectiveCamera): void {
    this._camera = camera;
    if (this._textGroup) {
      if (this._textGroup.parent) {
        this._textGroup.parent.remove(this._textGroup);
      }
      this._camera.add(this._textGroup);
      this._textGroup.position.set(0, -2.0, -4.5);
    }
  }

  public InitFonts(): void {
    try {
      this._fontLoader.load('./assets/fonts/typeface/Changa_Regular.json', (response) => {
        this._changaRegular = response;
      });
    } catch {
      // Ignore font load errors in unit test / headless environment
    }
  }

  public InitScene(scene: Scene): void {
    this._scene = scene;

    this._textGroup = new Group();
    this._textGroup.name = 'textGroup';
    this._textGroup.position.set(0, -2.0, -4.5);

    this._inSituContainer = new Group();
    this._inSituContainer.name = 'inSituTextGroup';
    this._scene.add(this._inSituContainer);

    if (this._camera) {
      this._camera.add(this._textGroup);
    } else {
      this._scene.add(this._textGroup);
    }
  }

  /**
   * Spawns floating 3D text in world space at the given position (e.g. piece match centroid).
   * Automatically handles vertical stacking and stagger delays if multiple messages occur at the same location.
   */
  public ShowFloatingText(text: string, worldPosition: Vector3, options?: Partial<SplashTextOptions>): void {
    if (!this._changaRegular || !this._inSituContainer) {
      return;
    }

    const now = performance.now();
    this._recentInSituSpawns = this._recentInSituSpawns.filter((s) => now - s.time < 1500);
    const nearbyCount = this._recentInSituSpawns.filter((s) => s.pos.distanceTo(worldPosition) < 1.5).length;

    const adjustedPos = worldPosition.clone();
    if (nearbyCount > 0) {
      adjustedPos.y += nearbyCount * 0.55;
    }

    const delayMs = options?.delayMs ?? (nearbyCount > 0 ? nearbyCount * 200 : 0);

    const splash = new SplashText(text, this._changaRegular, 0, {
      ...options,
      worldPosition: adjustedPos,
      delayMs,
      camera: this._camera,
      motionStyle: options?.motionStyle ?? SplashMotionStyle.PunchPop,
    });

    this._recentInSituSpawns.push({ pos: worldPosition.clone(), time: now });

    this._inSituContainer.add(splash);
    const sub = splash.AnimateText().subscribe((nextEvent) => {
      if (nextEvent === TextSplashEventType.OutroComplete) {
        this._inSituContainer.remove(splash);
        splash.Dispose();
        sub.unsubscribe();
      }
    });
  }

  public ShowText(message: string[], optionsOrColor?: SplashTextOptions | number, colorCycleFirstLine = false): void {
    if (!this._changaRegular) {
      return;
    }

    const options: SplashTextOptions =
      typeof optionsOrColor === 'number'
        ? { color: optionsOrColor, colorCycleFirstLine }
        : (optionsOrColor ?? { colorCycleFirstLine });

    if (message?.length) {
      let yOffset = 0;
      message.forEach((msg, index) => {
        const lineCycle = (options.colorCycleFirstLine ?? colorCycleFirstLine) && index === 0;
        const lineOptions: SplashTextOptions = {
          ...options,
          colorCycleFirstLine: lineCycle,
          camera: this._camera,
        };
        this._queue.push(new SplashText(msg, this._changaRegular, yOffset, lineOptions));
        yOffset -= 0.75;
      });
    }

    this.nextText();
  }

  public ShowPerfectMatch(points = 0, color?: number): void {
    this.ShowText(['Perfect Match!', `+${points} Points`], {
      color,
      colorCycleFirstLine: true,
      holdDurationMs: 1400,
      motionStyle: SplashMotionStyle.Fanfare,
      withParticles: true,
      particleColors: [0x00ffcc, 0xffd700, 0xffffff, 0xff00ff],
    });
  }

  public ShowSpeedBonus(points = 0, color?: number, worldPosition?: Vector3): void {
    if (worldPosition && this._inSituContainer && this._changaRegular) {
      const callout =
        points >= 1500
          ? MathUtils.randInt(0, 1) === 0
            ? 'LIGHTNING!'
            : 'BLAZING!'
          : points >= 800
            ? MathUtils.randInt(0, 1) === 0
              ? 'FAST!'
              : 'SNAP!'
            : 'QUICK!';

      this.ShowFloatingText(`${callout} +${points}`, worldPosition, {
        color: color ?? 0x00f0ff,
        motionStyle: SplashMotionStyle.PunchPop,
        holdDurationMs: 850,
        withParticles: true,
        particleColors: [0x00f0ff, 0xffea00, 0xffffff],
      });
    } else {
      this.ShowText(['Speed Bonus', `+${points} Points`], {
        color,
        motionStyle: SplashMotionStyle.PunchPop,
        holdDurationMs: 850,
      });
    }
  }

  public ShowLongMatchBonus(points = 0, color?: number, worldPosition?: Vector3, pieceCount = 4): void {
    if (worldPosition && this._inSituContainer && this._changaRegular) {
      let callout = 'NICE!';
      let scaleMultiplier = 1.0;

      if (pieceCount >= 7) {
        callout = 'MEGA COMBO!';
        scaleMultiplier = 1.45;
      } else if (pieceCount === 6) {
        callout = 'AWESOME!';
        scaleMultiplier = 1.3;
      } else if (pieceCount === 5) {
        callout = 'GREAT!';
        scaleMultiplier = 1.15;
      }

      this.ShowFloatingText(`${callout} +${points}`, worldPosition, {
        color: color ?? 0xffb800,
        scaleMultiplier,
        motionStyle: SplashMotionStyle.ImpactStamp,
        holdDurationMs: 950,
        withParticles: true,
        particleColors: [0xffb800, 0xff5500, 0xffffff, 0xffd700],
      });
    } else {
      this.ShowText(['Long Match', `+${points} Points`], {
        color,
        motionStyle: SplashMotionStyle.ImpactStamp,
        holdDurationMs: 950,
      });
    }
  }

  public ShowComboBonus(points = 0, pieceCount = 4, color?: number, worldPosition?: Vector3): void {
    const callout = pieceCount >= 6 ? 'Mega Combo' : 'Super Speed';
    if (worldPosition && this._inSituContainer && this._changaRegular) {
      this.ShowFloatingText(`${callout}! +${points}`, worldPosition, {
        color: color ?? 0xffd700,
        scaleMultiplier: 1.3,
        motionStyle: SplashMotionStyle.ImpactStamp,
        holdDurationMs: 1100,
        withParticles: true,
        particleColors: [0xffd700, 0x00f0ff, 0xff007f, 0x00ff88, 0xffffff],
      });
    } else {
      this.ShowText([`${callout}!`, `+${points} Points`], {
        color: color ?? 0xffd700,
        colorCycleFirstLine: true,
        motionStyle: SplashMotionStyle.ImpactStamp,
        holdDurationMs: 1100,
        withParticles: true,
      });
    }
  }

  public ShowPowerMove(label: string, points = 0, additionalMoves = 0, color?: number, worldPosition?: Vector3): void {
    if (additionalMoves > 0) {
      const moveText = additionalMoves === 1 ? '+1 Move' : `+${additionalMoves} Moves`;
      this.ShowText(['Multi-Power!', moveText, `+${points} Points`], {
        color,
        colorCycleFirstLine: true,
        holdDurationMs: 1200,
        motionStyle: SplashMotionStyle.Fanfare,
        withParticles: true,
        particleColors: [0xff00ea, 0x00ffcc, 0xffd700, 0xffffff],
      });
    } else {
      if (worldPosition && this._inSituContainer && this._changaRegular) {
        this.ShowFloatingText(`${label}! +${points}`, worldPosition, {
          color: color ?? 0xff00ea,
          motionStyle: SplashMotionStyle.PunchPop,
          holdDurationMs: 900,
          withParticles: true,
          particleColors: [0xff00ea, 0x00f0ff, 0xffffff],
        });
      } else {
        this.ShowText([`${label}!`, `+${points} Points`], {
          color,
          colorCycleFirstLine: true,
          motionStyle: SplashMotionStyle.Fanfare,
          holdDurationMs: 900,
          withParticles: true,
        });
      }
    }
  }

  private nextText(): void {
    if (!this._isPresenting) {
      const next = this._queue.shift();
      if (next) {
        this._textGroup.add(next);
        this._isPresenting = true;
        const sub = next.AnimateText().subscribe((nextEvent) => {
          switch (nextEvent) {
            case TextSplashEventType.IntroComplete:
              this._isPresenting = false;
              this.nextText();
              break;

            case TextSplashEventType.OutroComplete:
              this._textGroup.remove(next);
              next.Dispose();
              sub.unsubscribe();
              break;
          }
        });
      }
    }
  }
}
