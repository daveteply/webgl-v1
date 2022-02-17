import { Easing, Tween } from '@tweenjs/tween.js';
import { Observable, Subscriber } from 'rxjs';
import { Mesh, MeshPhongMaterial, Object3D } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font } from 'three/examples/jsm/loaders/FontLoader';
import { TextSplashEventType } from './text-splash-event-type';

export class SplashText extends Object3D {
  private _introTween!: any;
  private _outroTween!: any;

  private _textGeometry!: TextGeometry;
  private _material!: MeshPhongMaterial;
  private _mesh!: Mesh;

  private _font: Font;
  private _text: string;

  private _textSplashEvent!: Subscriber<TextSplashEventType>;

  constructor(text: string, font: Font) {
    super();
    this._text = text;
    this._font = font;

    // geometry
    this._textGeometry = new TextGeometry(this._text, {
      font: this._font,
      size: 40,
      height: 20,
      bevelEnabled: true,
      bevelThickness: 6,
      bevelSize: 4,
    });
    this._textGeometry.scale(0.01, 0.01, 0.01);

    this.position.x = this.xOffset(this._textGeometry);

    // material
    this._material = new MeshPhongMaterial({
      transparent: true,
      opacity: 0,
      color: 0x458800,
    });

    // mesh
    this._mesh = new Mesh(this._textGeometry, this._material);
    this.add(this._mesh);

    // intro tween
    const deltaIntro = { o: 0.0, y: 0.0 };
    const targetIntro = { o: 1.0, y: 3.0 };
    this._introTween = new Tween(deltaIntro)
      .to(targetIntro, 750)
      .easing(Easing.Quintic.InOut)
      .onUpdate(() => {
        this._material.opacity = deltaIntro.o;
        this._mesh.position.y = deltaIntro.y;
      });

    // outro tween
    const deltaOutro = { o: 1.0, z: 0.0 };
    const targetOutro = { o: 0.0, z: 3.0 };
    this._outroTween = new Tween(deltaOutro)
      .to(targetOutro, 500)
      .easing(Easing.Quintic.InOut)
      .onUpdate(() => {
        this._material.opacity = deltaOutro.o;
        this._mesh.position.z = deltaOutro.z;
      });

    this._introTween.chain(this._outroTween);
  }

  public Animate$: Observable<TextSplashEventType> = new Observable(
    (observer) => {
      this._introTween.start();
      this._introTween.onComplete(() => {
        observer.next(TextSplashEventType.IntroComplete);
      });
      this._outroTween.onComplete(() => {
        observer.next(TextSplashEventType.OutroComplete);
      });
    }
  );

  public Dispose(): void {
    this._material.dispose();
    this._textGeometry.dispose();
  }

  private xOffset(textGeometry: TextGeometry): number {
    textGeometry.computeBoundingBox();
    if (textGeometry.boundingBox) {
      return (
        -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x)
      );
    }
    return 0;
  }
}
