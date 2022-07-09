import {
  BoxBufferGeometry,
  BufferAttribute,
  Color,
  CylinderBufferGeometry,
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  Texture,
} from 'three';
import { TWO_PI, QUARTER_CIRCLE_RADIANS, DARK_RAINBOW_COLOR_ARRAY } from '../../game-constants';
import { Tween, Easing } from '@tweenjs/tween.js';
import { PowerMoveType } from '../power-move-type';
import { PowerMove } from './power-move';
import { PieceMaterials, PieceSideMaterial } from '../../services/material/material-models';
import { LevelGeometryType } from '../../level-geometry-type';

export class GamePiece extends Object3D {
  private _geometryCube: BoxBufferGeometry;
  private _meshCube: Mesh;
  private _geometryCylinder: CylinderBufferGeometry;
  private _meshCylinder: Mesh;
  private _powerMove!: PowerMove;

  private _mesh!: Mesh;

  private _originalRotationY!: number;

  private _pieceMaterials!: PieceSideMaterial[];
  private _pieceGeometryType!: LevelGeometryType;

  private _cylinderEndCapMaterials: MeshPhongMaterial[];

  // Original theta (angle) where the piece was drawn.
  // Used to help calculate the offset as the Wheel is moved.
  private _thetaStart: number;
  private _thetaOffset: number;

  private _lockTween: any;
  private _levelChangeTween: any;
  private _removeTween: any;

  // Each side material is arranged as follows:
  // 0 'back'
  // 1 'front'
  // 2 'top'
  // 3 'bottom'
  // The follow array is the sequence of side changes as the player
  //  flips.  This array will be shifted right or left based on
  //  flip direction.
  private _matchKeySequence: number[] = [1, 2, 0, 3];
  private _matchKey!: number;

  // for iterating over pieces checking for matches
  public Next!: GamePiece;
  public Prev!: GamePiece;

  public IsMatch: boolean = false;

  private _isRemoved: boolean = false;
  get IsRemoved(): boolean {
    return this._isRemoved;
  }

  private _isPowerMove: boolean = false;
  get IsPowerMove(): boolean {
    return this._isPowerMove;
  }

  private _powerMoveType!: PowerMoveType;
  get PowerMoveType(): PowerMoveType {
    return this._powerMoveType;
  }

  constructor(x: number, y: number, z: number, rotation: number) {
    super();

    this._originalRotationY = rotation;

    // position shell in grid
    this.position.set(x, y, z);
    this.rotateY(rotation);

    // cube piece
    this._geometryCube = new BoxBufferGeometry();
    // rotate uv so all vertical flipping displays correctly
    const sides = [
      [1, 0, 0, 0, 1, 1, 0, 1], // back (rotate PI)
      [0, 1, 1, 1, 0, 0, 1, 0], // front (keep original)
      [0, 0, 0, 1, 1, 0, 1, 1], // top (rotate PI/2)
      [1, 1, 1, 0, 0, 1, 0, 0], // bottom (rotate -PI/2)
      [0, 1, 1, 1, 0, 0, 1, 0], // side (keep original)
      [0, 1, 1, 1, 0, 0, 1, 0], // side (keep original)
    ];
    const uvs = new Float32Array(sides.flat());
    this._geometryCube.setAttribute('uv', new BufferAttribute(uvs, 2));
    this._meshCube = new Mesh(this._geometryCube);
    this.add(this._meshCube);

    // cylinder piece
    this._geometryCylinder = new CylinderBufferGeometry(0.6, 0.6, 1, 16);
    this._meshCylinder = new Mesh(this._geometryCylinder);
    this.add(this._meshCylinder);

    // interaction and matching values
    this._thetaStart = Math.abs(rotation);
    this._thetaOffset = this._thetaStart;

    // initialize end cap (top,bottom) materials for cylinder
    const endCapColor = DARK_RAINBOW_COLOR_ARRAY[MathUtils.randInt(0, DARK_RAINBOW_COLOR_ARRAY.length - 1)];
    this._cylinderEndCapMaterials = [
      new MeshPhongMaterial({ color: new Color(endCapColor) }),
      new MeshPhongMaterial({ color: new Color(endCapColor) }),
    ];
  }

  set ThetaOffset(theta: number) {
    this._thetaOffset = (((this._thetaStart - theta) % TWO_PI) + TWO_PI) % TWO_PI;
  }
  get ThetaOffset(): number {
    return this._thetaOffset;
  }

  get MatchKey(): number {
    return this._matchKey;
  }

  public Reset(levelGeometryType: LevelGeometryType): void {
    this._removeTween?.stop();
    this._isRemoved = false;

    this._pieceGeometryType = levelGeometryType;
    this._meshCube.visible = false;
    this._meshCylinder.visible = false;
    switch (this._pieceGeometryType) {
      case LevelGeometryType.Cube:
        this._meshCube.visible = true;
        this._mesh = this._meshCube;
        break;

      case LevelGeometryType.Cylinder:
        this._meshCylinder.visible = true;
        this._mesh = this._meshCylinder;
        break;
    }

    // reset power move
    if (this._powerMove) {
      this._isPowerMove = false;
      this.remove(this._powerMove.PowerMoveMesh);
      this._powerMove?.Dispose();
    }

    this._mesh.scale.set(1, 1, 1);
    this._mesh.rotation.x = 0;
    this._mesh.rotation.y = 0;
    this._mesh.rotation.z = 0;

    this._thetaStart = Math.abs(this._originalRotationY);
    this._thetaOffset = this._thetaStart;

    this._matchKeySequence = [1, 2, 0, 3];
  }

  public UpdateMaterials(pieceMaterials: PieceMaterials): void {
    this._pieceMaterials = pieceMaterials.materials;

    switch (this._pieceGeometryType) {
      case LevelGeometryType.Cube:
        this._meshCube.material = this._pieceMaterials.map((m) => {
          return m.useBasic ? m.materialBasic : m.materialPhong;
        });
        break;

      case LevelGeometryType.Cylinder:
        const target = this._pieceMaterials[this._matchKeySequence[0]];
        const targetMaterial = target.useBasic ? target.materialBasic : target.materialPhong;
        // cylinder side, top, bottom
        this._meshCylinder.material;
        this._meshCylinder.material = [targetMaterial, ...this._cylinderEndCapMaterials];
        break;
    }

    // 1 is the default (or "front"), will change when piece is flipped
    this._matchKey = this._pieceMaterials[this._matchKeySequence[0]]?.matchKey;
  }

  public AnimateLevelChangeTween(start: boolean): void {
    this._levelChangeTween?.stop();

    const delta = start ? { o: 0.0 } : { o: 1.0 };
    const target = start ? { o: 1.0 } : { o: 0.0 };
    this._levelChangeTween = new Tween(delta)
      .to(target, 2500)
      .delay(MathUtils.randInt(250, 1500))
      .onUpdate(() => {
        this._pieceMaterials.forEach((m) => {
          if (m.useBasic) {
            m.materialBasic.opacity = delta.o;
          } else {
            m.materialPhong.opacity = delta.o;
          }
        });
      })
      .start();
  }

  public AnimateLock(lock: boolean): void {
    if (!this._isRemoved && !this.IsMatch && !this._isPowerMove) {
      // stop tween
      this._lockTween?.stop();

      // set direction
      const origin = { x: 1.0, y: 1.0, z: 1.0, o: 1.0 };
      const final = { x: 0.8, y: 0.8, z: 0.8, o: 0.4 };

      const delta = lock ? origin : final;
      const target = lock ? final : origin;

      // init tween
      this._lockTween = new Tween(delta).to(target, 500).onUpdate(() => {
        this._mesh.scale.set(delta.x, delta.y, delta.z);
        this._pieceMaterials.forEach((m) => {
          if (m.useBasic) {
            m.materialBasic.opacity = delta.o;
          } else {
            m.materialPhong.opacity = delta.o;
          }
        });
      });

      if (lock) {
        this._lockTween.easing(Easing.Exponential.Out);
        this._lockTween.delay(MathUtils.randInt(50, 500));
      }

      this._lockTween.start();
    }
  }

  public InitSelectionTween(select: boolean): any {
    // values
    const origin = { x: 1.0, y: 1.0, z: 1.0 };
    const final = { x: 1.5, y: 1.25, z: 1.25 };

    // set direction
    const delta = select ? origin : final;
    const target = select ? final : origin;

    // init tween
    return new Tween(delta)
      .to(target, 250)
      .easing(Easing.Sinusoidal.Out)
      .onUpdate(() => {
        this._mesh.scale.set(delta.x, delta.y, delta.z);
      });
  }

  public AnimateRemovalTween(): void {
    // update removed state
    this._isRemoved = true;

    // set animation properties
    const delta = {
      x: this._mesh.rotation.x,
      y: this._mesh.rotation.y,
      z: this._mesh.rotation.z,
      o: 1.0,
    };
    const target = {
      x: delta.x + MathUtils.randFloat(-Math.PI, Math.PI),
      y: delta.y + MathUtils.randFloat(-Math.PI, Math.PI),
      z: delta.x + MathUtils.randFloat(-Math.PI, Math.PI),
      o: 0.0,
    };

    this._removeTween = new Tween(delta)
      .to(target, MathUtils.randInt(1000, 1500))
      .onUpdate(() => {
        this._mesh.rotation.x = delta.x;
        this._mesh.rotation.y = delta.y;
        this._mesh.rotation.z = delta.z;
        this._mesh.scale.set(delta.o, delta.o, delta.o);
        this._pieceMaterials.forEach((m) => {
          if (m.useBasic) {
            m.materialBasic.opacity = delta.o;
          } else {
            m.materialPhong.opacity = delta.o;
          }
        });
      })
      .start();
  }

  public AnimateFlipTween(turns: number, directionUp: boolean): void {
    if (!this._isPowerMove) {
      // set direction
      const delta = { theta: this._mesh.rotation.z };
      const final = {
        theta: delta.theta + QUARTER_CIRCLE_RADIANS * (directionUp ? -1 : 1) * turns,
      };

      // update match key by shifting array number of rotations
      for (let i = 0; i < turns; i++) {
        this._matchKeySequence = this._matchKeySequence.concat(
          this._matchKeySequence.splice(0, directionUp ? this._matchKeySequence.length - 1 : 1)
        );
      }

      // set match key
      this._matchKey = this._pieceMaterials[this._matchKeySequence[0]].matchKey;

      // tween
      new Tween(delta)
        .to(final, 1500)
        .easing(Easing.Sinusoidal.In)
        .delay(MathUtils.randInt(250, 750))
        .onUpdate(() => {
          this._mesh.rotation.z = delta.theta;
        })
        .start();
    }
  }

  // only 1 instance of power move; when the power move is selected, the
  //  state returns to removed
  public PowerMoveAdd(moveType: PowerMoveType, texture: Texture): void {
    // update states
    this._isPowerMove = true;
    this._isRemoved = false;
    this._matchKey = 0;
    this._powerMoveType = moveType;

    this._powerMove = new PowerMove(texture);
    this.add(this._powerMove.PowerMoveMesh);
    this._powerMove.AnimateIntro();
  }

  public PowerMoveRemove(): void {
    this._isRemoved = true;
    this._isPowerMove = false;
    this._powerMove.Remove();
  }
}
