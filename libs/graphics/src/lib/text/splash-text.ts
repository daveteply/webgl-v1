import { Easing, Tween } from '@tweenjs/tween.js';
import { mainTweenGroup } from '../services/tween-group';
import { Observable } from 'rxjs';
import { Color, MathUtils, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Vector3 } from 'three';
import { TextGeometry, TextGeometryParameters } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextSplashEventType } from './text-splash-event-type';
import { RAINBOW_COLOR_ARRAY } from '@rikkle/engine';
import { ConfettiBurst } from '../models/confetti-burst';

export enum SplashMotionStyle {
  PunchPop = 'punch-pop',
  ImpactStamp = 'impact-stamp',
  Fanfare = 'fanfare',
}

export interface SplashTextOptions {
  color?: number;
  colorCycleFirstLine?: boolean;
  introDurationMs?: number;
  holdDurationMs?: number;
  outroDurationMs?: number;
  delayMs?: number;
  motionStyle?: SplashMotionStyle;
  worldPosition?: Vector3;
  camera?: PerspectiveCamera;
  scaleMultiplier?: number;
  withParticles?: boolean;
  particleColors?: number[];
}

export class SplashText extends Object3D {
  private _introTween?: Tween<Record<string, number>>;
  private _outroTween?: Tween<Record<string, number>>;

  private _textGeometry!: TextGeometry;
  private _outlineGeometry!: TextGeometry;
  private _materials: MeshBasicMaterial[] = [];
  private _outlineMaterial!: MeshBasicMaterial;
  private _mesh!: Mesh;
  private _outlineMesh!: Mesh;
  private _confettiBurst?: ConfettiBurst;

  private _font: Font;
  private _text: string;

  private _colorCycle = false;
  private _hue = Math.random();

  private _camera?: PerspectiveCamera;
  private _isWorldSpace = false;
  private readonly _targetY: number = 3.0;

  constructor(text: string, font: Font, yOffset = 0, optionsOrColor?: SplashTextOptions | number, colorCycle = false) {
    super();
    this._text = text;
    this._font = font;

    const options: SplashTextOptions =
      typeof optionsOrColor === 'number'
        ? { color: optionsOrColor, colorCycleFirstLine: colorCycle }
        : (optionsOrColor ?? { colorCycleFirstLine: colorCycle });

    this._colorCycle = options.colorCycleFirstLine ?? colorCycle;
    this._camera = options.camera;
    this._isWorldSpace = !!options.worldPosition;

    const color = options.color;
    const motionStyle =
      options.motionStyle ?? (this._isWorldSpace ? SplashMotionStyle.PunchPop : SplashMotionStyle.Fanfare);

    const scaleMultiplier = options.scaleMultiplier ?? 1.0;

    // Set world position if provided (with safe viewport clamping & camera forward offset)
    if (options.worldPosition) {
      const pos = options.worldPosition.clone();
      // Clamp coordinates to safe visible viewport frustum so text never clips off screen edges
      pos.x = Math.max(-1.3, Math.min(1.3, pos.x));
      pos.y = Math.max(-1.6, Math.min(1.6, pos.y));

      if (this._camera) {
        const toCam = new Vector3().subVectors(this._camera.position, pos).normalize();
        pos.addScaledVector(toCam, 1.2);
        this.quaternion.copy(this._camera.quaternion);
      }
      this.position.copy(pos);
    }

    // geometry - bold, chunky typography with rich bevel depth
    const depth = this._isWorldSpace ? 5 : 8;
    const bevelThickness = this._isWorldSpace ? 1.6 : 2.2;
    const bevelSize = this._isWorldSpace ? 1.1 : 1.4;

    this._textGeometry = new TextGeometry(this._text, {
      font: this._font,
      size: 46,
      depth,
      bevelEnabled: true,
      bevelThickness,
      bevelSize,
      bevelSegments: 3,
    } as TextGeometryParameters);

    // Outline geometry - thicker bevel and depth to form a bold black back-hull border
    const outlineDepth = depth + 2;
    const outlineBevelThickness = this._isWorldSpace ? 2.0 : 2.6;
    const outlineBevelSize = this._isWorldSpace ? 2.4 : 3.0;

    this._outlineGeometry = new TextGeometry(this._text, {
      font: this._font,
      size: 46,
      depth: outlineDepth,
      bevelEnabled: true,
      bevelThickness: outlineBevelThickness,
      bevelSize: outlineBevelSize,
      bevelSegments: 3,
    } as TextGeometryParameters);

    const baseScale = (this._isWorldSpace ? 0.0125 : 0.01) * scaleMultiplier;
    this._textGeometry.scale(baseScale, baseScale, baseScale);
    this._outlineGeometry.scale(baseScale, baseScale, baseScale);

    // Auto-fit text geometry to ensure it never clips off-screen on narrow viewports
    this._textGeometry.computeBoundingBox();
    if (this._textGeometry.boundingBox) {
      const textWidth = this._textGeometry.boundingBox.max.x - this._textGeometry.boundingBox.min.x;
      const MAX_SAFE_WIDTH = this._isWorldSpace ? 2.9 : 2.3;
      if (textWidth > MAX_SAFE_WIDTH) {
        const fitScale = MAX_SAFE_WIDTH / textWidth;
        this._textGeometry.scale(fitScale, fitScale, fitScale);
        this._outlineGeometry.scale(fitScale, fitScale, fitScale);
      }
    }

    // material - front face & bevel/sides
    const baseColor =
      color !== undefined
        ? new Color(color)
        : new Color(RAINBOW_COLOR_ARRAY[MathUtils.randInt(0, RAINBOW_COLOR_ARRAY.length - 1)]);

    // Front face material - vibrant, pure color
    const frontMaterial = new MeshBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
    });

    // Side/bevel material - rich contrasting shade for crisp 3D outline
    const sideContrast = this._isWorldSpace ? 0.58 : 0.48;
    const sideColor = baseColor.clone().multiplyScalar(sideContrast);
    const sideMaterial = new MeshBasicMaterial({
      color: sideColor,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
    });

    this._materials = [frontMaterial, sideMaterial];

    // Outline material - high-contrast pure black back-hull
    this._outlineMaterial = new MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
    });

    // meshes - outline rendered behind front text
    this._outlineMesh = new Mesh(this._outlineGeometry, this._outlineMaterial);
    this._outlineMesh.renderOrder = 998;
    this.add(this._outlineMesh);

    this._mesh = new Mesh(this._textGeometry, this._materials);
    this._mesh.renderOrder = 1000;
    this.renderOrder = 1000;
    this.add(this._mesh);

    // Celebratory one-shot confetti burst
    if (options.withParticles) {
      this._confettiBurst = new ConfettiBurst(
        options.particleColors ?? [0xffd700, 0x00f0ff, 0xff007f, 0x00ff88, 0xffffff],
        scaleMultiplier,
      );
      this.add(this._confettiBurst);
    }

    const endX = this.xOffset(this._textGeometry);

    switch (motionStyle) {
      case SplashMotionStyle.PunchPop:
        this.initPunchPopAnimation(
          endX,
          yOffset,
          options.introDurationMs ?? 350,
          options.outroDurationMs ?? 700,
          options.holdDurationMs ?? 800,
        );
        break;

      case SplashMotionStyle.ImpactStamp:
        this.initImpactStampAnimation(
          endX,
          yOffset,
          options.introDurationMs ?? 400,
          options.outroDurationMs ?? 750,
          options.holdDurationMs ?? 900,
        );
        break;

      case SplashMotionStyle.Fanfare:
      default:
        this.initFanfareAnimation(
          endX,
          yOffset,
          options.introDurationMs ?? 550,
          options.outroDurationMs ?? 800,
          options.holdDurationMs ?? 1200,
        );
        break;
    }

    if (options.delayMs && options.delayMs > 0 && this._introTween) {
      this._introTween.delay(options.delayMs);
    }

    if (this._introTween && this._outroTween) {
      this._introTween.chain(this._outroTween);
    }
  }

  public AnimateText(): Observable<TextSplashEventType> {
    return new Observable((observer) => {
      this._introTween?.start();
      this._introTween?.onComplete(() => {
        observer.next(TextSplashEventType.IntroComplete);
      });
      this._outroTween?.onComplete(() => {
        observer.next(TextSplashEventType.OutroComplete);
      });
    });
  }

  public Dispose(): void {
    this._introTween?.stop();
    this._outroTween?.stop();
    this._materials.forEach((m) => m.dispose());
    this._outlineMaterial?.dispose();
    this._textGeometry.dispose();
    this._outlineGeometry?.dispose();
    this._confettiBurst?.Dispose();
  }

  private xOffset(textGeometry: TextGeometry): number {
    textGeometry.computeBoundingBox();
    if (textGeometry.boundingBox) {
      return -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
    }
    return 0;
  }

  /**
   * Snappy Punch-Pop: scale pops from 0 -> 1.25 -> 1.0 with subtle procedural micro-tilt,
   * then gently floats upward along +Y and fades out.
   */
  private initPunchPopAnimation(
    endX: number,
    yOffset: number,
    introDurationMs = 350,
    outroDurationMs = 650,
    holdDurationMs = 0,
  ): void {
    const baseY = this._isWorldSpace ? 0 : this._targetY + yOffset;
    const tilt = MathUtils.randFloat(-0.08, 0.08);
    const driftX = MathUtils.randFloat(-0.15, 0.15);

    this._mesh.position.set(endX, baseY, 0);
    this._mesh.scale.set(0, 0, 0);
    this._mesh.rotation.z = tilt;

    this._outlineMesh.position.set(endX, baseY, -0.04);
    this._outlineMesh.scale.set(0, 0, 0);
    this._outlineMesh.rotation.z = tilt;

    const introDelta = { scale: 0, opacity: 0 };
    const introTarget = { scale: 1.0, opacity: 1.0 };

    this._introTween = new Tween(introDelta, mainTweenGroup)
      .to(introTarget, introDurationMs)
      .easing(Easing.Back.Out)
      .onUpdate(() => {
        this.updateFrame(introDelta.opacity);
        this._mesh.scale.setScalar(introDelta.scale);
        this._outlineMesh.scale.setScalar(introDelta.scale);
      });

    const outroDelta = { scale: 1.0, opacity: 1.0, posY: baseY, posX: endX };
    const outroTarget = {
      scale: 0.9,
      opacity: 0.0,
      posY: baseY + (this._isWorldSpace ? 0.7 : 0.5),
      posX: endX + driftX,
    };

    this._outroTween = new Tween(outroDelta, mainTweenGroup)
      .to(outroTarget, outroDurationMs)
      .easing(Easing.Cubic.Out)
      .onUpdate(() => {
        this.updateFrame(outroDelta.opacity);
        this._mesh.scale.setScalar(outroDelta.scale);
        this._mesh.position.y = outroDelta.posY;
        this._mesh.position.x = outroDelta.posX;

        this._outlineMesh.scale.setScalar(outroDelta.scale);
        this._outlineMesh.position.y = outroDelta.posY;
        this._outlineMesh.position.x = outroDelta.posX;
      });

    if (holdDurationMs > 0) {
      this._outroTween.delay(holdDurationMs);
    }
  }

  /**
   * Heavy Impact-Stamp: drops from slightly above with large scale, stamps down with impact settling,
   * holds, and shimmers upward into a fade.
   */
  private initImpactStampAnimation(
    endX: number,
    yOffset: number,
    introDurationMs = 400,
    outroDurationMs = 700,
    holdDurationMs = 150,
  ): void {
    const baseY = this._isWorldSpace ? 0 : this._targetY + yOffset;
    const tilt = MathUtils.randFloat(-0.05, 0.05);

    this._mesh.position.set(endX, baseY + 0.6, 0);
    this._mesh.scale.set(1.5, 1.5, 1.5);
    this._mesh.rotation.z = tilt;

    this._outlineMesh.position.set(endX, baseY + 0.6, -0.04);
    this._outlineMesh.scale.set(1.5, 1.5, 1.5);
    this._outlineMesh.rotation.z = tilt;

    const introDelta = { scale: 1.5, posY: baseY + 0.6, opacity: 0 };
    const introTarget = { scale: 1.0, posY: baseY, opacity: 1.0 };

    this._introTween = new Tween(introDelta, mainTweenGroup)
      .to(introTarget, introDurationMs)
      .easing(Easing.Back.Out)
      .onUpdate(() => {
        this.updateFrame(introDelta.opacity);
        this._mesh.scale.setScalar(introDelta.scale);
        this._mesh.position.y = introDelta.posY;

        this._outlineMesh.scale.setScalar(introDelta.scale);
        this._outlineMesh.position.y = introDelta.posY;
      });

    const outroDelta = { scale: 1.0, opacity: 1.0, posY: baseY };
    const outroTarget = { scale: 1.15, opacity: 0.0, posY: baseY + 0.5 };

    this._outroTween = new Tween(outroDelta, mainTweenGroup)
      .to(outroTarget, outroDurationMs)
      .easing(Easing.Cubic.Out)
      .onUpdate(() => {
        this.updateFrame(outroDelta.opacity);
        this._mesh.scale.setScalar(outroDelta.scale);
        this._mesh.position.y = outroDelta.posY;

        this._outlineMesh.scale.setScalar(outroDelta.scale);
        this._outlineMesh.position.y = outroDelta.posY;
      });

    if (holdDurationMs > 0) {
      this._outroTween.delay(holdDurationMs);
    }
  }

  /**
   * Fanfare: majestic scale expansion from center, holds with sparkles, then gracefully drifts & fades.
   */
  private initFanfareAnimation(
    endX: number,
    yOffset: number,
    introDurationMs = 550,
    outroDurationMs = 800,
    holdDurationMs = 300,
  ): void {
    const baseY = this._isWorldSpace ? 0 : this._targetY + yOffset;

    this._mesh.position.set(endX, baseY, 0);
    this._mesh.scale.set(0.2, 0.2, 0.2);

    this._outlineMesh.position.set(endX, baseY, -0.04);
    this._outlineMesh.scale.set(0.2, 0.2, 0.2);

    const introDelta = { scale: 0.2, opacity: 0 };
    const introTarget = { scale: 1.0, opacity: 1.0 };

    this._introTween = new Tween(introDelta, mainTweenGroup)
      .to(introTarget, introDurationMs)
      .easing(Easing.Back.Out)
      .onUpdate(() => {
        this.updateFrame(introDelta.opacity);
        this._mesh.scale.setScalar(introDelta.scale);
        this._outlineMesh.scale.setScalar(introDelta.scale);
      });

    const outroDelta = { scale: 1.0, opacity: 1.0, posY: baseY };
    const outroTarget = { scale: 1.1, opacity: 0.0, posY: baseY + 0.6 };

    this._outroTween = new Tween(outroDelta, mainTweenGroup)
      .to(outroTarget, outroDurationMs)
      .easing(Easing.Cubic.Out)
      .onUpdate(() => {
        this.updateFrame(outroDelta.opacity);
        this._mesh.scale.setScalar(outroDelta.scale);
        this._mesh.position.y = outroDelta.posY;

        this._outlineMesh.scale.setScalar(outroDelta.scale);
        this._outlineMesh.position.y = outroDelta.posY;
      });

    if (holdDurationMs > 0) {
      this._outroTween.delay(holdDurationMs);
    }
  }

  private updateFrame(opacity: number): void {
    if (this._colorCycle) {
      this.updateColorCycle();
    }
    this._materials.forEach((m) => (m.opacity = opacity));
    if (this._outlineMaterial) {
      this._outlineMaterial.opacity = opacity;
    }

    if (this._isWorldSpace && this._camera) {
      this.quaternion.copy(this._camera.quaternion);
    }

    if (this._confettiBurst) {
      this._confettiBurst.Update();
    }
  }

  private updateColorCycle(): void {
    this._hue = (this._hue + 0.008) % 1.0;
    const frontMat = this._materials[0];
    const sideMat = this._materials[1];
    if (frontMat && sideMat) {
      frontMat.color.setHSL(this._hue, 1.0, 0.5);
      sideMat.color.copy(frontMat.color).multiplyScalar(0.45);
    }
  }
}
