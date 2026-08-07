import { Easing, Tween } from '@tweenjs/tween.js';
import { Observable } from 'rxjs';
import { Color, MathUtils, Mesh, MeshPhongMaterial, Object3D } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextSplashEventType } from './text-splash-event-type';
import { RAINBOW_COLOR_ARRAY } from '../../game-constants';

export class SplashText extends Object3D {
  private _introTween!: any;
  private _outroTween!: any;

  private _textGeometry!: TextGeometry;
  private _materials: MeshPhongMaterial[] = [];
  private _mesh!: Mesh;

  private _font: Font;
  private _text: string;

  private readonly _targetY: number = 3.0;

  constructor(text: string, font: Font, yOffset: number, color?: number) {
    super();
    this._text = text;
    this._font = font;

    // geometry
    this._textGeometry = new TextGeometry(this._text, {
      font: this._font,
      size: 40,
      depth: 20,
      bevelEnabled: true,
      bevelThickness: 6,
      bevelSize: 4,
    } as any);
    this._textGeometry.scale(0.01, 0.01, 0.01);

    // material - front face & bevel/sides
    const baseColor =
      color !== undefined
        ? new Color(color)
        : new Color(RAINBOW_COLOR_ARRAY[MathUtils.randInt(0, RAINBOW_COLOR_ARRAY.length - 1)]);

    // Front face material - matte, vibrant, soft diffuse shading
    const frontMaterial = new MeshPhongMaterial({
      color: baseColor,
      emissive: baseColor,
      emissiveIntensity: 0.12,
      specular: new Color(0x222222),
      shininess: 10,
      transparent: true,
      opacity: 0,
    });

    // Side/bevel material - 50% darker matte finish for bevel contrast
    const sideColor = baseColor.clone().multiplyScalar(0.5);
    const sideMaterial = new MeshPhongMaterial({
      color: sideColor,
      emissive: sideColor,
      emissiveIntensity: 0.05,
      specular: new Color(0x111111),
      shininess: 5,
      transparent: true,
      opacity: 0,
    });

    this._materials = [frontMaterial, sideMaterial];

    // mesh
    this._mesh = new Mesh(this._textGeometry, this._materials);
    this.add(this._mesh);

    this.initIntroTween(this.xOffset(this._textGeometry), yOffset);
    this.initOutroTween(yOffset);

    this._introTween.chain(this._outroTween);
  }

  public AnimateText(): Observable<TextSplashEventType> {
    return new Observable((observer) => {
      this._introTween.start();
      this._introTween.onComplete(() => {
        observer.next(TextSplashEventType.IntroComplete);
      });
      this._outroTween.onComplete(() => {
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

    this._introTween = new Tween(delta, true)
      .to(target, 750)
      .easing(Easing.Elastic.Out)
      .onUpdate(() => {
        this._materials.forEach((m) => (m.opacity = delta.o));
        this._mesh.position.x = delta.x;
        this._mesh.position.y = delta.y;
      });
  }

  private initOutroTween(yOffset: number): void {
    const delta = { o: 1.0, z: 0.0, y: this._targetY + yOffset };
    const target = { o: 0.0, z: 5.0, y: 2.0 };
    this._outroTween = new Tween(delta, true)
      .to(target, 1000)
      .easing(Easing.Quintic.InOut)
      .onUpdate(() => {
        this._materials.forEach((m) => (m.opacity = delta.o));
        this._mesh.position.z = delta.z;
        this._mesh.position.y = delta.y;
      });
  }
}
