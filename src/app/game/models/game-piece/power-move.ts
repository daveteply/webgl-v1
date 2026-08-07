import { Easing, Tween } from '@tweenjs/tween.js';
import { Observable } from 'rxjs';
import {
  BufferGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  OctahedronGeometry,
  Shape,
  TorusGeometry,
} from 'three';
import { RAINBOW_COLOR_ARRAY } from '../../game-constants';
import { PowerMoveType } from '../power-move-type';

export class PowerMove {
  private _root: Object3D;
  private _materials: MeshPhongMaterial[] = [];

  private _appearTween!: any;
  private _spinTween!: any;
  private _bounceTween!: any;

  private _powerMoveColor!: number;
  get PowerMoveColor(): number {
    return this._powerMoveColor;
  }

  get PowerMoveMesh(): Object3D {
    return this._root;
  }

  private static _geometryCache = new Map<PowerMoveType, BufferGeometry>();

  constructor(moveType: PowerMoveType, arg2?: any, color?: number) {
    const actualColor = typeof arg2 === 'number' ? arg2 : color;
    this._powerMoveColor = actualColor || RAINBOW_COLOR_ARRAY[MathUtils.randInt(0, RAINBOW_COLOR_ARRAY.length - 1)];

    const mainMaterial = new MeshPhongMaterial({
      color: this._powerMoveColor,
      emissive: this._powerMoveColor,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.0,
      shininess: 60,
    });
    this._materials.push(mainMaterial);

    if (moveType === PowerMoveType.Additive) {
      const group = new Group();

      const coreGeo = new OctahedronGeometry(0.35, 0);
      const coreMesh = new Mesh(coreGeo, mainMaterial);

      const ringMaterial = new MeshPhongMaterial({
        color: this._powerMoveColor,
        emissive: this._powerMoveColor,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.0,
      });
      this._materials.push(ringMaterial);

      const ringGeo = new TorusGeometry(0.55, 0.06, 12, 32);
      const ringMesh = new Mesh(ringGeo, ringMaterial);
      ringMesh.rotation.x = Math.PI / 3;

      group.add(coreMesh);
      group.add(ringMesh);
      this._root = group;
    } else {
      const geo = PowerMove.getGeometryForType(moveType);
      const mesh = new Mesh(geo, mainMaterial);
      this._root = mesh;
    }

    this._root.scale.set(0.001, 0.001, 0.001);
  }

  private static getGeometryForType(moveType: PowerMoveType): BufferGeometry {
    if (this._geometryCache.has(moveType)) {
      return this._geometryCache.get(moveType)!;
    }

    let geo: BufferGeometry;
    const extrudeSettings = {
      depth: 0.25,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    };

    switch (moveType) {
      case PowerMoveType.HorizontalRight: {
        const shape = PowerMove.createArrowShape('right');
        geo = new ExtrudeGeometry(shape, extrudeSettings);
        geo.center();
        break;
      }
      case PowerMoveType.HorizontalLeft: {
        const shape = PowerMove.createArrowShape('left');
        geo = new ExtrudeGeometry(shape, extrudeSettings);
        geo.center();
        break;
      }
      case PowerMoveType.HorizontalMix: {
        const shape = PowerMove.createArrowShape('horizontal-mix');
        geo = new ExtrudeGeometry(shape, extrudeSettings);
        geo.center();
        break;
      }
      case PowerMoveType.VerticalUp: {
        const shape = PowerMove.createArrowShape('up');
        geo = new ExtrudeGeometry(shape, extrudeSettings);
        geo.center();
        break;
      }
      case PowerMoveType.VerticalDown: {
        const shape = PowerMove.createArrowShape('down');
        geo = new ExtrudeGeometry(shape, extrudeSettings);
        geo.center();
        break;
      }
      case PowerMoveType.VerticalMix: {
        const shape = PowerMove.createArrowShape('vertical-mix');
        geo = new ExtrudeGeometry(shape, extrudeSettings);
        geo.center();
        break;
      }
      default: {
        geo = new CylinderGeometry(0.5, 0.5, 0.6, 16);
        break;
      }
    }

    this._geometryCache.set(moveType, geo);
    return geo;
  }

  private static createArrowShape(type: 'right' | 'left' | 'horizontal-mix' | 'up' | 'down' | 'vertical-mix'): Shape {
    const shape = new Shape();

    switch (type) {
      case 'right':
        shape.moveTo(-0.5, -0.2);
        shape.lineTo(0.0, -0.2);
        shape.lineTo(0.0, -0.45);
        shape.lineTo(0.55, 0.0);
        shape.lineTo(0.0, 0.45);
        shape.lineTo(0.0, 0.2);
        shape.lineTo(-0.5, 0.2);
        shape.closePath();
        break;

      case 'left':
        shape.moveTo(0.5, -0.2);
        shape.lineTo(0.0, -0.2);
        shape.lineTo(0.0, -0.45);
        shape.lineTo(-0.55, 0.0);
        shape.lineTo(0.0, 0.45);
        shape.lineTo(0.0, 0.2);
        shape.lineTo(0.5, 0.2);
        shape.closePath();
        break;

      case 'horizontal-mix':
        shape.moveTo(-0.55, 0.0);
        shape.lineTo(-0.15, -0.45);
        shape.lineTo(-0.15, -0.2);
        shape.lineTo(0.15, -0.2);
        shape.lineTo(0.15, -0.45);
        shape.lineTo(0.55, 0.0);
        shape.lineTo(0.15, 0.45);
        shape.lineTo(0.15, 0.2);
        shape.lineTo(-0.15, 0.2);
        shape.lineTo(-0.15, 0.45);
        shape.closePath();
        break;

      case 'up':
        shape.moveTo(0.0, 0.55);
        shape.lineTo(-0.45, 0.0);
        shape.lineTo(-0.2, 0.0);
        shape.lineTo(-0.2, -0.5);
        shape.lineTo(0.2, -0.5);
        shape.lineTo(0.2, 0.0);
        shape.lineTo(0.45, 0.0);
        shape.closePath();
        break;

      case 'down':
        shape.moveTo(0.0, -0.55);
        shape.lineTo(-0.45, 0.0);
        shape.lineTo(-0.2, 0.0);
        shape.lineTo(-0.2, 0.5);
        shape.lineTo(0.2, 0.5);
        shape.lineTo(0.2, 0.0);
        shape.lineTo(0.45, 0.0);
        shape.closePath();
        break;

      case 'vertical-mix':
        shape.moveTo(0.0, 0.55);
        shape.lineTo(0.45, 0.15);
        shape.lineTo(0.2, 0.15);
        shape.lineTo(0.2, -0.15);
        shape.lineTo(0.45, -0.15);
        shape.lineTo(0.0, -0.55);
        shape.lineTo(-0.45, -0.15);
        shape.lineTo(-0.2, -0.15);
        shape.lineTo(-0.2, 0.15);
        shape.lineTo(-0.45, 0.15);
        shape.closePath();
        break;
    }

    return shape;
  }

  public AnimateIntro(): Observable<void> {
    return new Observable((observer) => {
      const delta = { s: 0.001, o: 0.0 };
      const target = { s: 1.0, o: 0.85 };

      this._appearTween = new Tween(delta, true)
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

      let animTime = 0;
      this._bounceTween = new Tween({}, true)
        .repeat(Infinity)
        .onUpdate(() => {
          animTime += 0.05;
          this._root.rotation.y += 0.008;
          this._root.position.y = Math.sin(animTime) * 0.15;
        })
        .start();
    });
  }

  public Remove(): void {
    const delta = { s: this._root.scale.x, o: 0.85 };
    const target = { s: 4.0, o: 0.0 };
    new Tween(delta, true)
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
    this._materials.forEach((m) => m.dispose());
  }
}

