import { BoxBufferGeometry, BoxGeometry, MathUtils, Mesh, Object3D, Texture } from 'three';
import { TWO_PI, QUARTER_CIRCLE_RADIANS } from '../../game-constants';
import { GamePieceMaterial } from './game-piece-material';
import { GamePieceMaterialData } from './game-piece-material-data';
import { Tween, Easing } from '@tweenjs/tween.js';
import * as shuffleArray from 'shuffle-array';

export class GamePiece extends Object3D {
  private _innerGeometry: BoxGeometry;
  private _mesh: Mesh;

  private _gamePieceMaterials: GamePieceMaterial[] = [];

  // Original theta (angle) where the piece was drawn.
  // Used to help calculate the offset as the Wheel is moved.
  // This will eventually be used to understand if the piece is
  //   within the current view frustum.
  private _thetaStart: number;
  private _thetaOffset: number;

  private _lockTween: any;
  private _levelChangeTween: any;

  // Each side material is arranged as follows:
  // 0 'back'
  // 1 'front'
  // 2 'top'
  // 3 'bottom'
  // The follow array is the sequence of side changes as the player
  //  flips.  This array will be shifted right or left based on
  //  flip direction.
  private _matchKeySequence: number[] = [1, 2, 0, 3];
  private _matchKey: number;

  // for iterating over pieces checking for matches
  public Next!: GamePiece;
  public Prev!: GamePiece;

  public IsMatch: boolean = false;

  private _isRemoved: boolean = false;
  get IsRemoved(): boolean {
    return this._isRemoved;
  }

  constructor(x: number, y: number, z: number, rotation: number, materialData: GamePieceMaterialData[]) {
    super();

    // position shell in grid
    this.position.set(x, y, z);
    this.rotateY(rotation);

    // set up visual piece
    this._innerGeometry = new BoxBufferGeometry(1, 1, 1);

    // materials
    this.initMaterials(materialData);

    this._mesh = new Mesh(
      this._innerGeometry,
      this._gamePieceMaterials.map((m) => m.Material)
    );

    this.add(this._mesh);

    // interaction and matching values
    this._thetaStart = Math.abs(rotation);
    this._thetaOffset = this._thetaStart;

    // 1 is the default (or "front"), will change when piece is flipped
    this._matchKey = this._gamePieceMaterials[this._matchKeySequence[0]]?.MatchKey;
  }

  set ThetaOffset(theta: number) {
    this._thetaOffset = this.mod(this._thetaStart - theta, TWO_PI);
  }
  get ThetaOffset(): number {
    return this._thetaOffset;
  }

  get MatchKey(): number {
    return this._matchKey;
  }

  public AnimateLevelChangeTween(start: boolean): void {
    if (this._levelChangeTween) {
      this._levelChangeTween.stop();
    }

    const delta = start ? { o: 0.0 } : { o: 1.0 };
    const target = start ? { o: 1.0 } : { o: 0.0 };
    this._levelChangeTween = new Tween(delta)
      .to(target, start ? 2000 : 3000)
      .delay(MathUtils.randInt(250, 1000))
      .onUpdate(() => {
        this._gamePieceMaterials.forEach((m) => (m.Material.opacity = delta.o));
      })
      .start();
  }

  public AnimateLock(lock: boolean): void {
    if (!this._isRemoved && !this.IsMatch) {
      // stop if running
      if (this._lockTween) {
        this._lockTween.stop();
      }

      // set direction
      const origin = { x: 1.0, y: 1.0, z: 1.0, o: 1.0 };
      const final = { x: 0.8, y: 0.8, z: 0.8, o: 0.4 };

      const delta = lock ? origin : final;
      const target = lock ? final : origin;

      // init tween
      this._lockTween = new Tween(delta).to(target, 500).onUpdate(() => {
        this.scale.set(delta.x, delta.y, delta.z);
        this._gamePieceMaterials.forEach((m) => (m.Material.opacity = delta.o));
      });

      if (lock) {
        this._lockTween.easing(Easing.Exponential.Out);
        this._lockTween.delay(MathUtils.randInt(50, 500));
      }

      this._lockTween.start();
    }
  }

  public InitSelectionTween(select: boolean): any {
    // set direction
    const origin = { x: 1.0, y: 1.0, z: 1.0, o: 1.0 };
    const final = { x: 1.5, y: 1.25, z: 1.25, o: 1.0 };

    const delta = select ? origin : final;
    const target = select ? final : origin;

    // init tween
    return new Tween(delta)
      .to(target, 300)
      .easing(Easing.Quintic.Out)
      .onUpdate(() => {
        this.scale.set(delta.x, delta.y, delta.z);
      });
  }

  public InitRemovalTween(): void {
    // update removed state
    this._isRemoved = true;

    // set animation properties
    const delta = {
      x: this.rotation.x,
      y: this.rotation.y,
      z: this.rotation.y,
      o: 1.0,
    };
    const target = {
      x: delta.x + MathUtils.randFloat(-Math.PI, Math.PI),
      y: delta.y + MathUtils.randFloat(-Math.PI, Math.PI),
      z: delta.x + MathUtils.randFloat(-Math.PI, Math.PI),
      o: 0.0,
    };

    new Tween(delta)
      .to(target, MathUtils.randInt(250, 750))
      .onUpdate(() => {
        this.rotation.x = delta.x;
        this.rotation.y = delta.y;
        this.rotation.z = delta.x;
        this.scale.setScalar(delta.o);
        this._gamePieceMaterials.forEach((m) => (m.Material.opacity = delta.o));
      })
      .start();
  }

  public InitFlipTween(turns: number, directionUp: boolean): any {
    // set direction
    const delta = { theta: this.rotation.z };
    const final = {
      theta: this.rotation.z + QUARTER_CIRCLE_RADIANS * (directionUp ? -1 : 1) * turns,
    };

    // update match key by shifting array number of rotations
    for (let i = 0; i < turns; i++) {
      this._matchKeySequence = this._matchKeySequence.concat(
        this._matchKeySequence.splice(0, directionUp ? this._matchKeySequence.length - 1 : 1)
      );
    }

    // set match key
    this._matchKey = this._gamePieceMaterials[this._matchKeySequence[0]].MatchKey;

    // tween
    return new Tween(delta)
      .to(final, 500)
      .easing(Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        this.rotation.z = delta.theta;
      })
      .start();
  }

  public Dispose(): void {
    this._gamePieceMaterials.forEach((m) => m.Dispose());
    this._innerGeometry.dispose();
  }

  private initMaterials(materials: GamePieceMaterialData[]): void {
    // 0 'back'
    // 1 'front'
    // 2 'top'
    // 3 'bottom'

    const shuffledMaterials = shuffleArray(materials);
    const shuffledGamePieceMaterials = shuffledMaterials.map(
      (m) => new GamePieceMaterial(m.MatchKey, m.Texture, m.BumpTexture, m.Color)
    );
    this._gamePieceMaterials.push(...shuffledGamePieceMaterials);

    // for (let i = 0; i < 6; i++) {
    //   const randMaterial =
    //     materials[Math.floor(Math.random() * materials.length)];

    //   let texture;
    //   if (randMaterial) {
    //     if (randMaterial.Texture) {
    //       texture = this.cloneRotateTexture(randMaterial.Texture, i);
    //     }

    //     this._gamePieceMaterials.push(
    //       new GamePieceMaterial(
    //         randMaterial.MatchKey,
    //         texture,
    //         randMaterial.BumpTexture,
    //         randMaterial.Color
    //       )
    //     );
    //   }
    // }
  }

  private cloneRotateTexture(texture: Texture, edge: number): Texture | undefined {
    // 0 'back'
    // 1 'front'
    // 2 'top'
    // 3 'bottom'

    if (texture) {
      const cloned = texture.clone();
      if (cloned) {
        cloned.needsUpdate = true;

        switch (edge) {
          case 0:
            cloned.rotation = QUARTER_CIRCLE_RADIANS * 2;
            break;

          case 2:
            cloned.rotation = QUARTER_CIRCLE_RADIANS * 3;
            break;

          case 3:
            cloned.rotation = QUARTER_CIRCLE_RADIANS;
            break;
        }
        return cloned;
      }
    }
    return undefined;
  }

  private mod(a: number, n: number): number {
    return ((a % n) + n) % n;
  }
}
