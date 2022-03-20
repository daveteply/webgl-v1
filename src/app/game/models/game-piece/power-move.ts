import { Easing, Tween } from '@tweenjs/tween.js';
import { CylinderGeometry, MathUtils, Mesh, MeshPhongMaterial, Texture } from 'three';
import { RAINBOW_COLOR_ARRAY } from '../../game-constants';

export class PowerMove {
  private _geometry!: CylinderGeometry;
  private _mesh!: Mesh;
  private _material!: MeshPhongMaterial;

  private _spinTween!: any;
  private _bounceTween!: any;

  get PowerMoveMesh(): Mesh {
    return this._mesh;
  }

  constructor(texture: Texture) {
    // create new geometry, material, mesh
    this._geometry = new CylinderGeometry(1, 1, 1.5, 16);
    this._geometry.scale(0.01, 0.01, 0.01);
    this._material = new MeshPhongMaterial({
      color: RAINBOW_COLOR_ARRAY[MathUtils.randInt(0, RAINBOW_COLOR_ARRAY.length - 1)],
      transparent: true,
      opacity: 0.0,
      bumpMap: texture,
      bumpScale: 0.5,
    });
    this._mesh = new Mesh(this._geometry, this._material);
  }

  public AnimateIntro(): void {
    const delta = { s: 0.1, o: 0.0 };
    const target = { s: 40.0, o: 0.8 };
    new Tween(delta)
      .to(target, 750)
      .easing(Easing.Bounce.InOut)
      .onUpdate(() => {
        this._mesh.scale.setScalar(delta.s);
        this._material.opacity = delta.o;
      })
      .start();

    this._spinTween = new Tween({})
      .repeat(Infinity)
      .onUpdate(() => {
        this._mesh.rotateY(0.005);
      })
      .start();

    const deltaB = { y: -0.05 };
    const targetB = { y: 0.05 };
    this._bounceTween = new Tween(deltaB)
      .to(targetB, 750)
      .repeat(Infinity)
      .easing(Easing.Quadratic.InOut)
      .yoyo(true)
      .onUpdate(() => {
        this._mesh.position.y = deltaB.y;
      })
      .start();
  }

  public Remove(): void {
    const delta = { s: this._mesh.scale.x, o: 0.8 };
    const target = { s: 300.0, o: 0.0 };
    new Tween(delta)
      .to(target, 500)
      .easing(Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        this._mesh.scale.setScalar(delta.s);
        this._mesh.translateZ(-0.01);
        this._material.opacity = delta.o;
      })
      .onComplete(() => {
        this._mesh.scale.setScalar(0);
        if (this._spinTween) {
          this._spinTween.stop();
        }
      })
      .start();
  }

  public Dispose(): void {
    if (this._spinTween) {
      this._spinTween.stop();
    }
    if (this._bounceTween) {
      this._bounceTween.stop();
    }
    if (this._geometry) {
      this._geometry.dispose();
    }
    if (this._material) {
      this._material.dispose();
    }
  }
}
