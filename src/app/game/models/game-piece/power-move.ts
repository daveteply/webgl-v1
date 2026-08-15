import { Easing, Tween } from '@tweenjs/tween.js';
import { mainTweenGroup } from '../../services/tween-group';
import { Observable } from 'rxjs';
import {
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  ExtrudeGeometry,
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  Shape,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RAINBOW_COLOR_ARRAY } from '../../game-constants';
import { PowerMoveType } from '../power-move-type';
import { ParticleEmitter } from '../particle-emitter';

export class PowerMove {
  private _root: Object3D;
  private _materials: MeshPhongMaterial[] = [];
  private _sparkEmitter?: ParticleEmitter;

  private _appearTween?: Tween<Record<string, number>>;
  private _spinTween?: Tween<Record<string, number>>;
  private _bounceTween?: Tween<Record<string, number>>;

  private _slideOffsetY = 0;
  get SlideOffsetY(): number {
    return this._slideOffsetY;
  }
  set SlideOffsetY(offset: number) {
    this._slideOffsetY = offset;
    this._root.position.y = this._slideOffsetY;
  }

  private _powerMoveColor!: number;
  get PowerMoveColor(): number {
    return this._powerMoveColor;
  }

  get PowerMoveMesh(): Object3D {
    return this._root;
  }

  private static _geometryCache = new Map<PowerMoveType, BufferGeometry>();

  constructor(moveType: PowerMoveType, color?: number, isIntro = true) {
    this._powerMoveColor = color || RAINBOW_COLOR_ARRAY[MathUtils.randInt(0, RAINBOW_COLOR_ARRAY.length - 1)];

    const mainMaterial = new MeshPhongMaterial({
      color: this._powerMoveColor,
      emissive: this._powerMoveColor,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: isIntro ? 0.0 : 0.85,
      shininess: 60,
    });
    this._materials.push(mainMaterial);

    const geo = PowerMove.getGeometryForType(moveType);
    const mesh = new Mesh(geo, mainMaterial);
    this._root = mesh;

    // Attach burning fuse spark emitter for Bomb power move
    if (moveType === PowerMoveType.Bomb) {
      this._sparkEmitter = new ParticleEmitter({
        count: 14,
        size: 0.07,
        colors: [0xffff55, 0xff8800, 0xff2200, 0xffffff],
        spread: 0.03,
        speed: 0.012,
        lifetime: 20,
      });
      // Position emitter at the tip of the curved wick
      this._sparkEmitter.position.set(0.16, 0.44, -0.02);
      mesh.add(this._sparkEmitter);
    }

    if (isIntro) {
      this._root.scale.set(0.001, 0.001, 0.001);
    } else {
      this._root.scale.set(1.0, 1.0, 1.0);
      this.startBounceTween();
    }
  }

  private static getGeometryForType(moveType: PowerMoveType): BufferGeometry {
    if (this._geometryCache.has(moveType)) {
      return this._geometryCache.get(moveType)!;
    }

    let geo: BufferGeometry;

    if (moveType === PowerMoveType.Bomb) {
      // 1. Classic bomb sphere body
      const sphereGeo = new SphereGeometry(0.35, 24, 20);

      // 2. Small cylinder collar on top
      const collarGeo = new CylinderGeometry(0.09, 0.11, 0.12, 16);
      collarGeo.translate(0, 0.33, 0);

      // 3. Curved wick using TubeGeometry
      const wickCurve = new CatmullRomCurve3([
        new Vector3(0, 0.37, 0),
        new Vector3(0.05, 0.44, 0.02),
        new Vector3(0.12, 0.5, 0.0),
        new Vector3(0.16, 0.54, -0.02),
      ]);
      const wickGeo = new TubeGeometry(wickCurve, 16, 0.025, 8, false);

      const merged = mergeGeometries([sphereGeo, collarGeo, wickGeo]);
      sphereGeo.dispose();
      collarGeo.dispose();
      wickGeo.dispose();

      merged.center();
      geo = merged;
    } else {
      const extrudeSettings = {
        depth: 0.25,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.04,
        bevelThickness: 0.04,
      };
      const shapes = PowerMove.createArrowShape(moveType);
      geo = new ExtrudeGeometry(shapes, extrudeSettings);
      geo.center();
    }

    this._geometryCache.set(moveType, geo);
    return geo;
  }

  private static createArrowShape(type: PowerMoveType): Shape | Shape[] {
    switch (type) {
      case PowerMoveType.HorizontalRight: {
        const shape = new Shape();
        shape.moveTo(-0.5, -0.2);
        shape.lineTo(0.0, -0.2);
        shape.lineTo(0.0, -0.45);
        shape.lineTo(0.55, 0.0);
        shape.lineTo(0.0, 0.45);
        shape.lineTo(0.0, 0.2);
        shape.lineTo(-0.5, 0.2);
        shape.closePath();
        return shape;
      }

      case PowerMoveType.HorizontalLeft: {
        const shape = new Shape();
        shape.moveTo(0.5, -0.2);
        shape.lineTo(0.0, -0.2);
        shape.lineTo(0.0, -0.45);
        shape.lineTo(-0.55, 0.0);
        shape.lineTo(0.0, 0.45);
        shape.lineTo(0.0, 0.2);
        shape.lineTo(0.5, 0.2);
        shape.closePath();
        return shape;
      }

      case PowerMoveType.HorizontalMix: {
        // Two long skinny horizontal arrows (one above the other: RIGHT on top, LEFT on bottom)
        const topRightArrow = new Shape();
        topRightArrow.moveTo(0.42, 0.14);
        topRightArrow.lineTo(0.18, 0.28);
        topRightArrow.lineTo(0.18, 0.19);
        topRightArrow.lineTo(-0.42, 0.19);
        topRightArrow.lineTo(-0.42, 0.09);
        topRightArrow.lineTo(0.18, 0.09);
        topRightArrow.lineTo(0.18, 0.0);
        topRightArrow.closePath();

        const bottomLeftArrow = new Shape();
        bottomLeftArrow.moveTo(-0.42, -0.14);
        bottomLeftArrow.lineTo(-0.18, -0.28);
        bottomLeftArrow.lineTo(-0.18, -0.19);
        bottomLeftArrow.lineTo(0.42, -0.19);
        bottomLeftArrow.lineTo(0.42, -0.09);
        bottomLeftArrow.lineTo(-0.18, -0.09);
        bottomLeftArrow.lineTo(-0.18, 0.0);
        bottomLeftArrow.closePath();

        return [topRightArrow, bottomLeftArrow];
      }

      case PowerMoveType.VerticalUp: {
        const shape = new Shape();
        shape.moveTo(0.0, 0.55);
        shape.lineTo(-0.45, 0.0);
        shape.lineTo(-0.2, 0.0);
        shape.lineTo(-0.2, -0.5);
        shape.lineTo(0.2, -0.5);
        shape.lineTo(0.2, 0.0);
        shape.lineTo(0.45, 0.0);
        shape.closePath();
        return shape;
      }

      case PowerMoveType.VerticalDown: {
        const shape = new Shape();
        shape.moveTo(0.0, -0.55);
        shape.lineTo(-0.45, 0.0);
        shape.lineTo(-0.2, 0.0);
        shape.lineTo(-0.2, 0.5);
        shape.lineTo(0.2, 0.5);
        shape.lineTo(0.2, 0.0);
        shape.lineTo(0.45, 0.0);
        shape.closePath();
        return shape;
      }

      case PowerMoveType.VerticalMix: {
        // Two long skinny vertical arrows (side-by-side: UP on left, DOWN on right)
        const leftUpArrow = new Shape();
        leftUpArrow.moveTo(-0.14, 0.42);
        leftUpArrow.lineTo(-0.28, 0.18);
        leftUpArrow.lineTo(-0.19, 0.18);
        leftUpArrow.lineTo(-0.19, -0.42);
        leftUpArrow.lineTo(-0.09, -0.42);
        leftUpArrow.lineTo(-0.09, 0.18);
        leftUpArrow.lineTo(0.0, 0.18);
        leftUpArrow.closePath();

        const rightDownArrow = new Shape();
        rightDownArrow.moveTo(0.14, -0.42);
        rightDownArrow.lineTo(0.28, -0.18);
        rightDownArrow.lineTo(0.19, -0.18);
        rightDownArrow.lineTo(0.19, 0.42);
        rightDownArrow.lineTo(0.09, 0.42);
        rightDownArrow.lineTo(0.09, -0.18);
        rightDownArrow.lineTo(0.0, -0.18);
        rightDownArrow.closePath();

        return [leftUpArrow, rightDownArrow];
      }

      default: {
        const shape = new Shape();
        shape.absarc(0, 0, 0.4, 0, Math.PI * 2, false);
        return shape;
      }
    }
  }

  public AnimateIntro(): Observable<void> {
    return new Observable((observer) => {
      const delta = { s: 0.001, o: 0.0 };
      const target = { s: 1.0, o: 0.85 };

      this._appearTween = new Tween(delta, mainTweenGroup)
        .to(target, 1500)
        .easing(Easing.Bounce.Out)
        .onUpdate(() => {
          this._root.scale.setScalar(delta.s);
          this._materials.forEach((m) => (m.opacity = delta.o));
        })
        .onComplete(() => {
          observer.next();
          observer.complete();
        })
        .start();

      this.startBounceTween();
    });
  }

  private startBounceTween(): void {
    this._bounceTween?.stop();
    let animTime = 0;
    this._bounceTween = new Tween({}, mainTweenGroup)
      .repeat(Infinity)
      .onUpdate(() => {
        animTime += 0.05;
        this._root.rotation.y += 0.008;
        this._root.position.y = this._slideOffsetY + Math.sin(animTime) * 0.15;
        this._sparkEmitter?.Update();
      })
      .start();
  }

  public Remove(): void {
    this._bounceTween?.stop();
    const delta = { s: this._root.scale.x, o: 0.85 };
    const target = { s: 4.0, o: 0.0 };
    new Tween(delta, mainTweenGroup)
      .to(target, 500)
      .easing(Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        this._root.scale.setScalar(delta.s);
        this._root.translateZ(-0.01);
        this._materials.forEach((m) => (m.opacity = delta.o));
      })
      .onComplete(() => {
        this._root.scale.setScalar(0);
        this._spinTween?.stop();
      })
      .start();
  }

  public Dispose(): void {
    this._appearTween?.stop();
    this._spinTween?.stop();
    this._bounceTween?.stop();
    this._sparkEmitter?.Dispose();
    this._materials.forEach((m) => m.dispose());
  }
}
