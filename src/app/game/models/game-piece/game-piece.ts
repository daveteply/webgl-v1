import {
  BoxGeometry,
  BufferAttribute,
  Color,
  CylinderGeometry,
  DodecahedronGeometry,
  Material,
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  Vector3,
} from 'three';
import { take } from 'rxjs';
import { TWO_PI, QUARTER_CIRCLE_RADIANS, DARK_RAINBOW_COLOR_ARRAY, UV_SIDES } from '../../game-constants';
import { Tween, Easing } from '@tweenjs/tween.js';
import { mainTweenGroup } from '../../services/tween-group';
import { PowerMoveType } from '../power-move-type';
import { PowerMove } from './power-move';
import { PieceMaterials, PieceSideMaterial } from '../../services/material/material-models';
import { LevelGeometryType } from '../level-geometry-type';
import { GamePieceRemovalStyle } from './game-piece-removal-style';
import { LevelAnimationStyle } from '../level-animation-style';
import type { GameWheel } from '../game-wheel';

export interface PieceStateSnapshot {
  isRemoved: boolean;
  matchKeySequence: number[];
  matchKey: number;
  pieceMaterials: PieceSideMaterial[];
  pieceGeometryType: LevelGeometryType;
  isPowerMove: boolean;
  powerMoveType?: PowerMoveType;
  powerMoveColor?: number;
}

export class GamePiece extends Object3D {
  private _geometryCube: BoxGeometry;
  private _meshCube: Mesh;
  private _geometryCylinder: CylinderGeometry;
  private _meshCylinder: Mesh;
  private _geometryDodecahedron: DodecahedronGeometry;
  private _meshDodecahedron: Mesh;

  private _mesh!: Mesh;

  private _pieceMaterials!: PieceSideMaterial[];
  private _pieceGeometryType!: LevelGeometryType;

  private _cylinderEndCapMaterials: MeshPhongMaterial[];

  // Original theta (angle) where the piece was drawn.
  // Used to help calculate the offset as the Wheel is moved.
  private _thetaStart: number;
  private _thetaOffset: number;

  private _lockTween?: Tween<Record<string, number>>;
  private _levelChangeTween?: Tween<Record<string, number>>;
  private _removeTween?: Tween<Record<string, number>>;

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

  public IsMatch = false;

  private _isRemoved = false;
  get IsRemoved(): boolean {
    return this._isRemoved;
  }

  private _powerMove!: PowerMove;
  get PowerMove(): PowerMove {
    return this._powerMove;
  }

  private _isPowerMove = false;
  get IsPowerMove(): boolean {
    return this._isPowerMove;
  }

  private _powerMoveType!: PowerMoveType;
  get PowerMoveType(): PowerMoveType {
    return this._powerMoveType;
  }

  // Pure domain property accessors (camelCase)
  get matchKey(): number {
    return this._matchKey;
  }

  get thetaOffset(): number {
    return this._thetaOffset;
  }

  get isMatch(): boolean {
    return this.IsMatch;
  }
  set isMatch(val: boolean) {
    this.IsMatch = val;
  }

  get isRemoved(): boolean {
    return this._isRemoved;
  }

  get isPowerMove(): boolean {
    return this._isPowerMove;
  }

  get powerMoveType(): PowerMoveType {
    return this._powerMoveType;
  }

  get next(): GamePiece {
    return this.Next;
  }

  get prev(): GamePiece {
    return this.Prev;
  }

  get parentWheel(): GameWheel | undefined {
    return this.parent as GameWheel | undefined;
  }

  private static sharedCubeGeometry: BoxGeometry | null = null;
  private static sharedCylinderGeometry: CylinderGeometry | null = null;
  private static sharedDodecahedronGeometry: DodecahedronGeometry | null = null;

  private static getSharedCubeGeometry(): BoxGeometry {
    if (!GamePiece.sharedCubeGeometry) {
      const geo = new BoxGeometry();
      const uvs = new Float32Array(UV_SIDES.flat());
      geo.setAttribute('uv', new BufferAttribute(uvs, 2));
      GamePiece.sharedCubeGeometry = geo;
    }
    return GamePiece.sharedCubeGeometry;
  }

  private static getSharedCylinderGeometry(): CylinderGeometry {
    if (!GamePiece.sharedCylinderGeometry) {
      GamePiece.sharedCylinderGeometry = new CylinderGeometry(0.6, 0.6, 1, 16);
    }
    return GamePiece.sharedCylinderGeometry;
  }

  private static getSharedDodecahedronGeometry(): DodecahedronGeometry {
    if (!GamePiece.sharedDodecahedronGeometry) {
      const geo = new DodecahedronGeometry(0.6, 0);
      // Align pentagonal flat surface directly facing the wheel center (-Z) and player (+Z)
      const alignAngle = -Math.atan((Math.sqrt(5) - 1) / 2);
      geo.rotateY(alignAngle);
      GamePiece.generatePentagonUVs(geo);
      GamePiece.sharedDodecahedronGeometry = geo;
    }
    return GamePiece.sharedDodecahedronGeometry;
  }

  private static generatePentagonUVs(geo: DodecahedronGeometry): void {
    const pos = geo.attributes['position'];
    if (!pos) return;

    const uvs = new Float32Array(pos.count * 2);
    const vA = new Vector3();
    const vB = new Vector3();
    const vC = new Vector3();
    const normal = new Vector3();
    const uTangent = new Vector3();
    const vTangent = new Vector3();
    const center = new Vector3();
    const p = new Vector3();

    // 12 faces, 9 vertices per face (3 triangles * 3 vertices)
    for (let face = 0; face < pos.count; face += 9) {
      // Calculate face normal using first triangle
      vA.fromBufferAttribute(pos, face);
      vB.fromBufferAttribute(pos, face + 1);
      vC.fromBufferAttribute(pos, face + 2);

      normal.subVectors(vC, vB).cross(new Vector3().subVectors(vA, vB)).normalize();

      // Compute face center
      center.set(0, 0, 0);
      for (let i = 0; i < 9; i++) {
        p.fromBufferAttribute(pos, face + i);
        center.add(p);
      }
      center.divideScalar(9);

      // Create tangent basis vectors on pentagon plane
      uTangent.set(0, 1, 0).cross(normal);
      if (uTangent.lengthSq() < 0.0001) {
        uTangent.set(1, 0, 0).cross(normal);
      }
      uTangent.normalize();
      vTangent.crossVectors(normal, uTangent).normalize();

      // Find max distance from center to normalize UVs to [0, 1]
      let maxDist = 0.001;
      for (let i = 0; i < 9; i++) {
        p.fromBufferAttribute(pos, face + i);
        const dist = p.distanceTo(center);
        if (dist > maxDist) maxDist = dist;
      }

      // Map UVs for each vertex in this face
      for (let i = 0; i < 9; i++) {
        p.fromBufferAttribute(pos, face + i).sub(center);
        const uVal = 0.5 + p.dot(uTangent) / (maxDist * 2.2);
        const vVal = 0.5 + p.dot(vTangent) / (maxDist * 2.2);
        const uIndex = (face + i) * 2;
        uvs[uIndex] = uVal;
        uvs[uIndex + 1] = vVal;
      }
    }

    geo.setAttribute('uv', new BufferAttribute(uvs, 2));
  }

  constructor(x: number, y: number, z: number, rotation: number) {
    super();

    // position shell in grid
    this.position.set(x, y, z);
    this.rotateY(rotation);

    // cube piece
    this._geometryCube = GamePiece.getSharedCubeGeometry();
    this._meshCube = new Mesh(this._geometryCube);
    this.add(this._meshCube);

    // cylinder piece
    this._geometryCylinder = GamePiece.getSharedCylinderGeometry();
    this._meshCylinder = new Mesh(this._geometryCylinder);
    this.add(this._meshCylinder);

    // dodecahedron piece
    this._geometryDodecahedron = GamePiece.getSharedDodecahedronGeometry();
    this._meshDodecahedron = new Mesh(this._geometryDodecahedron);
    this.add(this._meshDodecahedron);

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

  public SetGeometryType(geometryType: LevelGeometryType): void {
    this._pieceGeometryType = geometryType;
    this._meshCube.visible = false;
    this._meshCylinder.visible = false;
    this._meshDodecahedron.visible = false;
    switch (this._pieceGeometryType) {
      case LevelGeometryType.Cube:
        this._meshCube.visible = true;
        this._mesh = this._meshCube;
        break;
      case LevelGeometryType.Cylinder:
        this._meshCylinder.visible = true;
        this._mesh = this._meshCylinder;
        break;
      case LevelGeometryType.Dodecahedron:
        this._meshDodecahedron.visible = true;
        this._mesh = this._meshDodecahedron;
        break;
    }
  }

  public Reset(levelGeometryType: LevelGeometryType): void {
    this._matchKeySequence = [1, 2, 0, 3];
    this.StopTweens();
    this._isRemoved = false;

    // set geometry type and set normalized access variable
    this.SetGeometryType(levelGeometryType);

    // reset power move
    if (this._powerMove) {
      this._isPowerMove = false;
      this.remove(this._powerMove.PowerMoveMesh);
      this._powerMove?.Dispose();
      this._powerMove = undefined as unknown as PowerMove;
    }

    const parentWheel = this.parent as (Object3D & { Theta?: number }) | null;
    if (parentWheel && parentWheel.Theta !== undefined) {
      this.ThetaOffset = parentWheel.Theta;
    } else {
      this._thetaOffset = this._thetaStart;
    }
  }

  public StopTweens(preserveLock = false): void {
    this._removeTween?.stop();
    this._levelChangeTween?.stop();
    this._lockTween?.stop();
    if (this._mesh) {
      this._mesh.position.set(0, 0, 0);
      this._mesh.rotation.set(0, 0, this.getMeshRestingRotationZ());
      if (!preserveLock) {
        this._mesh.scale.set(1, 1, 1);
      }
    }
  }

  public UpdateMaterials(pieceMaterials?: PieceMaterials): void {
    if (!pieceMaterials?.materials) {
      return;
    }
    this._pieceMaterials = pieceMaterials.materials;

    let target: PieceSideMaterial;
    let targetMaterial: Material;

    switch (this._pieceGeometryType) {
      case LevelGeometryType.Cube:
        this._meshCube.material = this._pieceMaterials.map((m) => {
          return m.useBasic ? m.materialBasic : m.materialPhong;
        });
        break;

      case LevelGeometryType.Cylinder:
        target = this._pieceMaterials[this._matchKeySequence[0]];
        if (target) {
          targetMaterial = target.useBasic ? target.materialBasic : target.materialPhong;
          // cylinder side, top, bottom
          this._meshCylinder.material = [targetMaterial, ...this._cylinderEndCapMaterials];
        }
        break;

      case LevelGeometryType.Dodecahedron:
        target = this._pieceMaterials[this._matchKeySequence[0]];
        if (target) {
          targetMaterial = target.useBasic ? target.materialBasic : target.materialPhong;
          this._meshDodecahedron.material = targetMaterial;
        }
        break;
    }

    // 1 is the default (or "front"), will change when piece is flipped
    this._matchKey = this._pieceMaterials[this._matchKeySequence[0]]?.matchKey;
  }

  public AnimateLevelChangeTween(
    start: boolean,
    style: LevelAnimationStyle = LevelAnimationStyle.RadialAssemble,
    delayOffset = 0,
  ): void {
    this._levelChangeTween?.stop();

    const rad = this._thetaStart;
    const dirX = Math.cos(rad);
    const dirZ = Math.sin(rad);

    let startX = 0;
    let startY = 0;
    let startZ = 0;
    let startRotX = 0;
    let startRotY = 0;
    let startRotZ = 0;
    let startScaleX = 1;
    let startScaleY = 1;
    let startScaleZ = 1;

    let targetX = 0;
    let targetY = 0;
    let targetZ = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let targetRotZ = 0;
    let targetScaleX = 1;
    let targetScaleY = 1;
    let targetScaleZ = 1;

    let easingFunc = start ? Easing.Sinusoidal.Out : Easing.Sinusoidal.In;

    switch (style) {
      case LevelAnimationStyle.RadialAssemble: {
        const mult = start ? MathUtils.randFloat(6.0, 11.0) : MathUtils.randFloat(8.0, 15.0);
        const yOff = MathUtils.randFloat(-5.0, 5.0);
        if (start) {
          startX = dirX * mult;
          startZ = dirZ * mult;
          startY = yOff;
          startRotX = MathUtils.randFloat(-Math.PI * 2, Math.PI * 2);
          startRotY = MathUtils.randFloat(-Math.PI * 2, Math.PI * 2);
          startRotZ = MathUtils.randFloat(-Math.PI, Math.PI);
          startScaleX = startScaleY = startScaleZ = 0.05;
          easingFunc = Easing.Back.Out;
        } else {
          targetX = dirX * mult;
          targetZ = dirZ * mult;
          targetY = yOff;
          targetRotX = MathUtils.randFloat(-Math.PI * 2, Math.PI * 2);
          targetRotY = MathUtils.randFloat(-Math.PI * 2, Math.PI * 2);
          targetScaleX = targetScaleY = targetScaleZ = 0.0;
          easingFunc = Easing.Quadratic.In;
        }
        break;
      }
      case LevelAnimationStyle.SpiralVortex: {
        const radius = MathUtils.randFloat(6.0, 10.0);
        const altY = MathUtils.randFloat(8.0, 15.0) * (MathUtils.randInt(0, 1) ? 1 : -1);
        if (start) {
          startX = dirX * radius + dirZ * 3.0;
          startZ = dirZ * radius - dirX * 3.0;
          startY = altY;
          startRotY = Math.PI * 6;
          startScaleX = startScaleY = startScaleZ = 0.05;
          easingFunc = Easing.Cubic.Out;
        } else {
          targetX = dirX * radius - dirZ * 4.0;
          targetZ = dirZ * radius + dirX * 4.0;
          targetY = altY * -1;
          targetRotY = -Math.PI * 6;
          targetScaleX = targetScaleY = targetScaleZ = 0.0;
          easingFunc = Easing.Cubic.In;
        }
        break;
      }
      case LevelAnimationStyle.ScatterSnap: {
        if (start) {
          startX = MathUtils.randFloat(-12, 12);
          startY = MathUtils.randFloat(-12, 12);
          startZ = MathUtils.randFloat(-12, 12);
          startRotX = MathUtils.randFloat(-Math.PI * 3, Math.PI * 3);
          startRotY = MathUtils.randFloat(-Math.PI * 3, Math.PI * 3);
          startRotZ = MathUtils.randFloat(-Math.PI * 3, Math.PI * 3);
          startScaleX = startScaleY = startScaleZ = 0.02;
          easingFunc = Easing.Exponential.Out;
        } else {
          targetX = MathUtils.randFloat(-15, 15);
          targetY = MathUtils.randFloat(-15, 15);
          targetZ = MathUtils.randFloat(-15, 15);
          targetRotX = MathUtils.randFloat(-Math.PI * 3, Math.PI * 3);
          targetRotY = MathUtils.randFloat(-Math.PI * 3, Math.PI * 3);
          targetRotZ = MathUtils.randFloat(-Math.PI * 3, Math.PI * 3);
          targetScaleX = targetScaleY = targetScaleZ = 0.0;
          easingFunc = Easing.Exponential.In;
        }
        break;
      }
      case LevelAnimationStyle.CascadeWave: {
        const xDist = MathUtils.randFloat(3.5, 4.5) * (MathUtils.randInt(0, 1) ? 1 : -1);
        if (start) {
          startX = xDist;
          startZ = dirZ * MathUtils.randFloat(1.5, 3.0);
          startY = MathUtils.randFloat(-0.8, 0.8);
          startScaleX = 1.35;
          startScaleY = startScaleZ = 0.85;
          startRotZ = MathUtils.randFloat(-0.25, 0.25);
          easingFunc = Easing.Bounce.Out;
        } else {
          targetX = -xDist * 1.5;
          targetZ = dirZ * MathUtils.randFloat(2.0, 4.5);
          targetScaleX = 0.1;
          targetScaleY = targetScaleZ = 0.1;
          targetRotZ = MathUtils.randFloat(-0.3, 0.3);
          easingFunc = Easing.Quadratic.In;
        }
        break;
      }
    }

    // Set initial properties for mesh
    this._mesh.position.set(startX, startY, startZ);
    this._mesh.rotation.set(startRotX, startRotY, startRotZ);
    this._mesh.scale.set(startScaleX, startScaleY, startScaleZ);

    const delta = {
      px: startX,
      py: startY,
      pz: startZ,
      rx: startRotX,
      ry: startRotY,
      rz: startRotZ,
      sx: startScaleX,
      sy: startScaleY,
      sz: startScaleZ,
      o: start ? 0.0 : 1.0,
    };
    const target = {
      px: targetX,
      py: targetY,
      pz: targetZ,
      rx: targetRotX,
      ry: targetRotY,
      rz: targetRotZ,
      sx: targetScaleX,
      sy: targetScaleY,
      sz: targetScaleZ,
      o: start ? 1.0 : 0.0,
    };

    const delay = delayOffset + MathUtils.randInt(100, 600);

    this._levelChangeTween = new Tween(delta, mainTweenGroup)
      .to(target, 2200)
      .delay(delay)
      .easing(easingFunc)
      .onUpdate(() => {
        this._mesh.position.set(delta.px, delta.py, delta.pz);
        this._mesh.rotation.set(delta.rx, delta.ry, delta.rz);
        this._mesh.scale.set(delta.sx, delta.sy, delta.sz);
        this._pieceMaterials?.forEach((m) => {
          if (m.useBasic) {
            m.materialBasic.opacity = delta.o;
          } else {
            m.materialPhong.opacity = delta.o;
          }
        });
      })
      .onComplete(() => {
        if (start) {
          this._mesh.position.set(0, 0, 0);
          this._mesh.rotation.set(0, 0, 0);
          this._mesh.scale.set(1, 1, 1);
        }
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
      this._lockTween = new Tween(delta, mainTweenGroup).to(target, 500).onUpdate(() => {
        this._mesh.scale.set(delta.x, delta.y, delta.z);
        this._pieceMaterials?.forEach((m) => {
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

  public InitSelectionTween(select: boolean): Tween<{ x: number; y: number; z: number }> {
    // values
    const origin = { x: 1.0, y: 1.0, z: 1.0 };
    const final = { x: 1.5, y: 1.25, z: 1.25 };

    // set direction
    const delta = select ? origin : final;
    const target = select ? final : origin;

    // init tween
    return new Tween(delta, mainTweenGroup)
      .to(target, 250)
      .easing(Easing.Sinusoidal.Out)
      .onUpdate(() => {
        this._mesh.scale.set(delta.x, delta.y, delta.z);
      });
  }

  public AnimateRemovalTween(style: GamePieceRemovalStyle): Tween<Record<string, number>> {
    // update removed state
    this._isRemoved = true;

    if (!this._mesh) {
      switch (this._pieceGeometryType) {
        case LevelGeometryType.Cylinder:
          this._mesh = this._meshCylinder;
          break;
        case LevelGeometryType.Dodecahedron:
          this._mesh = this._meshDodecahedron;
          break;
        default:
          this._mesh = this._meshCube;
      }
    }

    const startRotX = this._mesh.rotation.x;
    const startRotY = this._mesh.rotation.y;
    const startRotZ = this._mesh.rotation.z;
    const startPosX = this._mesh.position.x;
    const startPosY = this._mesh.position.y;
    const startPosZ = this._mesh.position.z;

    const rad = this._thetaStart;
    const dirX = Math.cos(rad);
    const dirZ = Math.sin(rad);

    let targetRotX = startRotX + MathUtils.randFloat(-Math.PI * 2, Math.PI * 2);
    let targetRotY = startRotY + MathUtils.randFloat(-Math.PI * 2, Math.PI * 2);
    let targetRotZ = startRotZ + MathUtils.randFloat(-Math.PI * 2, Math.PI * 2);

    let targetPosX = startPosX;
    let targetPosY = startPosY;
    let targetPosZ = startPosZ;
    let peakScale = 1.0;
    let easingFunc: (k: number) => number = Easing.Sinusoidal.Out;

    switch (style) {
      case GamePieceRemovalStyle.FadeTranslate:
        targetPosX += 0.8;
        break;

      case GamePieceRemovalStyle.ImplodePop:
        peakScale = 1.4;
        easingFunc = Easing.Back.Out;
        targetRotX = startRotX + MathUtils.randFloat(-Math.PI * 3, Math.PI * 3);
        targetRotY = startRotY + MathUtils.randFloat(-Math.PI * 3, Math.PI * 3);
        break;

      case GamePieceRemovalStyle.ExplodeScatter: {
        const scatterDist = MathUtils.randFloat(2.5, 4.5);
        targetPosX = dirX * scatterDist;
        targetPosZ = dirZ * scatterDist;
        targetPosY = startPosY + MathUtils.randFloat(-2.0, 2.0);
        targetRotX = startRotX + MathUtils.randFloat(-Math.PI * 4, Math.PI * 4);
        targetRotY = startRotY + MathUtils.randFloat(-Math.PI * 4, Math.PI * 4);
        targetRotZ = startRotZ + MathUtils.randFloat(-Math.PI * 4, Math.PI * 4);
        easingFunc = Easing.Quadratic.Out;
        break;
      }

      case GamePieceRemovalStyle.VortexSpiral: {
        const spiralDist = MathUtils.randFloat(1.5, 3.0);
        targetPosX = dirX * spiralDist + dirZ * 1.5;
        targetPosZ = dirZ * spiralDist - dirX * 1.5;
        targetPosY = startPosY + MathUtils.randFloat(2.0, 4.0);
        targetRotY = startRotY + Math.PI * 6;
        easingFunc = Easing.Cubic.Out;
        break;
      }

      case GamePieceRemovalStyle.GravitationalDrop: {
        targetPosY = startPosY - MathUtils.randFloat(4.0, 7.0);
        targetRotX = startRotX + MathUtils.randFloat(-Math.PI * 2, Math.PI * 2);
        targetRotZ = startRotZ + MathUtils.randFloat(-Math.PI * 2, Math.PI * 2);
        easingFunc = Easing.Quadratic.In;
        break;
      }
    }

    const delta = {
      px: startPosX,
      py: startPosY,
      pz: startPosZ,
      rx: startRotX,
      ry: startRotY,
      rz: startRotZ,
      o: 1.0,
    };

    const target = {
      px: targetPosX,
      py: targetPosY,
      pz: targetPosZ,
      rx: targetRotX,
      ry: targetRotY,
      rz: targetRotZ,
      o: 0.0,
    };

    const duration = MathUtils.randInt(800, 1300);

    this._removeTween = new Tween(delta, mainTweenGroup)
      .to(target, duration)
      .easing(easingFunc)
      .onUpdate(() => {
        this._mesh.position.set(delta.px, delta.py, delta.pz);
        this._mesh.rotation.set(delta.rx, delta.ry, delta.rz);

        let currentScale = delta.o;
        if (style === GamePieceRemovalStyle.ImplodePop && delta.o > 0.4) {
          currentScale = 1.0 + (peakScale - 1.0) * Math.sin((1 - delta.o) * Math.PI);
        }
        this._mesh.scale.set(currentScale, currentScale, currentScale);

        this._pieceMaterials?.forEach((m) => {
          if (m.useBasic) {
            m.materialBasic.opacity = delta.o;
          } else {
            m.materialPhong.opacity = delta.o;
          }
        });
      })
      .start();

    return this._removeTween;
  }

  public AnimateFlipTween(turns: number, directionUp: boolean): void {
    if (!this._isPowerMove && !this._isRemoved && turns > 0) {
      // set direction
      const delta = { theta: this._mesh.rotation.z };
      const final = {
        theta: delta.theta + QUARTER_CIRCLE_RADIANS * (directionUp ? -1 : 1) * turns,
      };

      // update match key by shifting array number of rotations
      for (let i = 0; i < turns; i++) {
        this._matchKeySequence = this._matchKeySequence.concat(
          this._matchKeySequence.splice(0, directionUp ? this._matchKeySequence.length - 1 : 1),
        );
      }

      // set match key
      this._matchKey = this._pieceMaterials[this._matchKeySequence[0]].matchKey;
      if (this._pieceGeometryType === LevelGeometryType.Cylinder) {
        const target = this._pieceMaterials[this._matchKeySequence[0]];
        const targetMaterial = target.useBasic ? target.materialBasic : target.materialPhong;
        this._meshCylinder.material = [targetMaterial, ...this._cylinderEndCapMaterials];
      } else if (this._pieceGeometryType === LevelGeometryType.Dodecahedron) {
        const target = this._pieceMaterials[this._matchKeySequence[0]];
        const targetMaterial = target.useBasic ? target.materialBasic : target.materialPhong;
        this._meshDodecahedron.material = targetMaterial;
      }

      // tween
      new Tween(delta, mainTweenGroup)
        .to(final, MathUtils.randInt(1000, 1500))
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
  public PowerMoveAdd(moveType: PowerMoveType, color?: number, isIntro = true): void {
    this._removeTween?.stop();
    this._isRemoved = false;
    this._isPowerMove = true;
    this._matchKey = 0;
    this._powerMoveType = moveType;

    // Completely hide base mesh geometries so they do not render or write to depth buffer
    if (this._meshCube) this._meshCube.visible = false;
    if (this._meshCylinder) this._meshCylinder.visible = false;
    if (this._meshDodecahedron) this._meshDodecahedron.visible = false;
    if (this._mesh) {
      this._mesh.visible = false;
      this._mesh.position.set(0, 0, 0);
      this._mesh.rotation.set(0, 0, 0);
      this._mesh.scale.set(1, 1, 1);
    }

    this._pieceMaterials?.forEach((m) => {
      if (m.useBasic) {
        m.materialBasic.opacity = 0;
      } else {
        m.materialPhong.opacity = 0;
      }
    });

    if (this._powerMove) {
      this.remove(this._powerMove.PowerMoveMesh);
      this._powerMove.Dispose();
    }

    this._powerMove = new PowerMove(moveType, color, isIntro);
    this.add(this._powerMove.PowerMoveMesh);

    if (isIntro) {
      this._powerMove
        .AnimateIntro()
        .pipe(take(1))
        .subscribe(() => {
          this._isRemoved = false;
          this._isPowerMove = true;
        });
    }
  }

  public PowerMoveRemove(): void {
    this._isRemoved = true;
    this._isPowerMove = false;
    this._powerMove?.Remove();
    if (this._meshCube) this._meshCube.visible = false;
    if (this._meshCylinder) this._meshCylinder.visible = false;
    if (this._meshDodecahedron) this._meshDodecahedron.visible = false;
    if (this._mesh) {
      this._mesh.visible = false;
    }
  }

  public GetStateSnapshot(): PieceStateSnapshot {
    return {
      isRemoved: this._isRemoved,
      matchKeySequence: [...this._matchKeySequence],
      matchKey: this._matchKey,
      pieceMaterials: this._pieceMaterials,
      pieceGeometryType: this._pieceGeometryType,
      isPowerMove: this._isPowerMove,
      powerMoveType: this._powerMoveType,
      powerMoveColor: this._powerMove?.PowerMoveColor,
    };
  }

  public ApplyStateSnapshot(snapshot: PieceStateSnapshot): void {
    this.StopTweens(true);

    this._isRemoved = snapshot.isRemoved;
    this._matchKeySequence = [...snapshot.matchKeySequence];
    this.SetGeometryType(snapshot.pieceGeometryType);
    if (snapshot.pieceMaterials) {
      this.UpdateMaterials({ materials: snapshot.pieceMaterials });
    }
    this._matchKey = snapshot.matchKey;

    // clean up existing power move if present
    if (this._powerMove) {
      this._isPowerMove = false;
      this.remove(this._powerMove.PowerMoveMesh);
      this._powerMove?.Dispose();
      this._powerMove = undefined as unknown as PowerMove;
    }

    if (snapshot.isPowerMove && snapshot.powerMoveType !== undefined) {
      this.PowerMoveAdd(snapshot.powerMoveType, snapshot.powerMoveColor, false);
    } else {
      this._isPowerMove = false;
      if (this._mesh) {
        this._mesh.visible = !snapshot.isRemoved;
      }
      const baseOpacity = snapshot.isRemoved ? 0 : 1.0;
      this._pieceMaterials?.forEach((m) => {
        if (m.useBasic) {
          m.materialBasic.opacity = baseOpacity;
        } else {
          m.materialPhong.opacity = baseOpacity;
        }
      });
    }
  }

  public CopyStateFrom(source: GamePiece): void {
    this.ApplyStateSnapshot(source.GetStateSnapshot());
  }

  public AnimateGravitySlide(startOffsetY: number, duration: number, isLocked = true): Tween<{ y: number }> {
    this._removeTween?.stop();
    this._levelChangeTween?.stop();
    this._lockTween?.stop();
    this._isRemoved = false;

    if (!this._mesh) {
      switch (this._pieceGeometryType) {
        case LevelGeometryType.Cylinder:
          this._mesh = this._meshCylinder;
          break;
        case LevelGeometryType.Dodecahedron:
          this._mesh = this._meshDodecahedron;
          break;
        default:
          this._mesh = this._meshCube;
      }
    }

    const scale = isLocked ? 0.8 : 1.0;
    const opacity = isLocked ? 0.4 : 1.0;

    const delta = { y: startOffsetY };
    const target = { y: 0 };

    if (this._isPowerMove && this._powerMove) {
      // Keep base piece mesh completely invisible for power move pieces
      if (this._meshCube) this._meshCube.visible = false;
      if (this._meshCylinder) this._meshCylinder.visible = false;
      if (this._meshDodecahedron) this._meshDodecahedron.visible = false;
      if (this._mesh) {
        this._mesh.visible = false;
        this._mesh.position.set(0, 0, 0);
        this._mesh.rotation.set(0, 0, 0);
      }
      this._pieceMaterials?.forEach((m) => {
        if (m.useBasic) {
          m.materialBasic.opacity = 0;
        } else {
          m.materialPhong.opacity = 0;
        }
      });

      this._powerMove.SlideOffsetY = startOffsetY;

      return new Tween(delta, mainTweenGroup)
        .to(target, duration)
        .easing(Easing.Bounce.Out)
        .onUpdate(() => {
          if (this._powerMove) {
            this._powerMove.SlideOffsetY = delta.y;
          }
        })
        .onComplete(() => {
          if (this._powerMove) {
            this._powerMove.SlideOffsetY = 0;
          }
        });
    }

    if (this._mesh) {
      this._mesh.visible = true;
    }
    this._mesh.position.set(0, startOffsetY, 0);
    this._mesh.rotation.set(0, 0, this.getMeshRestingRotationZ());
    this._mesh.scale.set(scale, scale, scale);

    this._pieceMaterials?.forEach((m) => {
      if (m.useBasic) {
        m.materialBasic.opacity = opacity;
      } else {
        m.materialPhong.opacity = opacity;
      }
    });

    return new Tween(delta, mainTweenGroup)
      .to(target, duration)
      .easing(Easing.Bounce.Out)
      .onUpdate(() => {
        this._mesh.position.y = delta.y;
      })
      .onComplete(() => {
        this._mesh.position.set(0, 0, 0);
        this._mesh.rotation.set(0, 0, this.getMeshRestingRotationZ());
        this._mesh.scale.set(scale, scale, scale);
        this._pieceMaterials?.forEach((m) => {
          if (m.useBasic) {
            m.materialBasic.opacity = opacity;
          } else {
            m.materialPhong.opacity = opacity;
          }
        });
      });
  }

  public GetMeshRestingRotationZ(): number {
    return this.getMeshRestingRotationZ();
  }

  private getMeshRestingRotationZ(): number {
    if (this._pieceGeometryType !== LevelGeometryType.Cube || !this._matchKeySequence?.length) {
      return 0;
    }
    switch (this._matchKeySequence[0]) {
      case 1:
        return 0;
      case 2:
        return QUARTER_CIRCLE_RADIANS;
      case 0:
        return Math.PI;
      case 3:
        return -QUARTER_CIRCLE_RADIANS;
      default:
        return 0;
    }
  }
}
