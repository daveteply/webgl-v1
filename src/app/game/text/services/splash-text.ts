import { Easing, Tween } from '@tweenjs/tween.js';
import { mainTweenGroup } from '../../services/tween-group';
import { Observable } from 'rxjs';
import { Color, MathUtils, Mesh, MeshBasicMaterial, Object3D } from 'three';
import { TextGeometry, TextGeometryParameters } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextSplashEventType } from './text-splash-event-type';
import { RAINBOW_COLOR_ARRAY } from '../../game-constants';

export class SplashText extends Object3D {
  private _introTween?: Tween<Record<string, number>>;
  private _outroTween?: Tween<Record<string, number>>;

  private _textGeometry!: TextGeometry;
  private _materials: MeshBasicMaterial[] = [];
  private _mesh!: Mesh;

  private _font: Font;
  private _text: string;

  private _colorCycle = false;
  private _hue = Math.random();

  private readonly _targetY: number = 3.0;

  constructor(text: string, font: Font, yOffset: number, color?: number, colorCycle = false) {
    super();
    this._text = text;
    this._font = font;
    this._colorCycle = colorCycle;

    // geometry
    this._textGeometry = new TextGeometry(this._text, {
      font: this._font,
      size: 40,
      depth: 20,
      bevelEnabled: true,
      bevelThickness: 6,
      bevelSize: 4,
    } as TextGeometryParameters);
    this._textGeometry.scale(0.01, 0.01, 0.01);

    // Auto-fit text geometry to ensure it never clips off-screen on narrow or mobile viewports
    this._textGeometry.computeBoundingBox();
    if (this._textGeometry.boundingBox) {
      const textWidth = this._textGeometry.boundingBox.max.x - this._textGeometry.boundingBox.min.x;
      const MAX_SAFE_WIDTH = 2.3;
      if (textWidth > MAX_SAFE_WIDTH) {
        const fitScale = MAX_SAFE_WIDTH / textWidth;
        this._textGeometry.scale(fitScale, fitScale, fitScale);
      }
    }

    // material - front face & bevel/sides
    const baseColor =
      color !== undefined
        ? new Color(color)
        : new Color(RAINBOW_COLOR_ARRAY[MathUtils.randInt(0, RAINBOW_COLOR_ARRAY.length - 1)]);

    // Front face material - vibrant, pure color (unaffected by point light over-exposure)
    const frontMaterial = new MeshBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0,
    });

    // Side/bevel material - 50% darker contrasting shade for crisp 3D depth and outline
    const sideColor = baseColor.clone().multiplyScalar(0.45);
    const sideMaterial = new MeshBasicMaterial({
      color: sideColor,
      transparent: true,
      opacity: 0,
    });

    this._materials = [frontMaterial, sideMaterial];

    // mesh
    this._mesh = new Mesh(this._textGeometry, this._materials);
    this.add(this._mesh);

    this.initIntroTween(this.xOffset(this._textGeometry), yOffset);
    this.initOutroTween(yOffset);

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
    this._textGeometry.dispose();
  }

  private xOffset(textGeometry: TextGeometry): number {
    textGeometry.computeBoundingBox();
    if (textGeometry.boundingBox) {
      return -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
    }
    return 0;
  }

  private initIntroTween(endX: number, yOffset: number): void {
    const delta = { o: 0, x: 0, y: 0 };
    const target = { o: 1.0, x: 0, y: 0 };
    switch (MathUtils.randInt(1, 3)) {
      // from left
      case 1:
        delta.x = -5;
        target.x = endX;
        delta.y = this._targetY + yOffset;
        target.y = this._targetY + yOffset;
        break;

      // from right
      case 2:
        delta.x = 5;
        target.x = endX;
        delta.y = this._targetY + yOffset;
        target.y = this._targetY + yOffset;
        break;

      // from bottom
      case 3:
        delta.x = endX;
        target.x = endX;
        delta.y = -5;
        target.y = this._targetY + yOffset;
        break;
    }

    this._introTween = new Tween(delta, mainTweenGroup)
      .to(target, 750)
      .easing(Easing.Elastic.Out)
      .onUpdate(() => {
        if (this._colorCycle) {
          this.updateColorCycle();
        }
        this._materials.forEach((m) => (m.opacity = delta.o));
        this._mesh.position.x = delta.x;
        this._mesh.position.y = delta.y;
      });
  }

  private initOutroTween(yOffset: number): void {
    const delta = { o: 1.0, z: 0.0, y: this._targetY + yOffset };
    const target = { o: 0.0, z: 3.8, y: 2.0 };
    this._outroTween = new Tween(delta, mainTweenGroup)
      .to(target, 1000)
      .easing(Easing.Quintic.InOut)
      .onUpdate(() => {
        if (this._colorCycle) {
          this.updateColorCycle();
        }
        this._materials.forEach((m) => (m.opacity = delta.o));
        this._mesh.position.z = delta.z;
        this._mesh.position.y = delta.y;
      });
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
