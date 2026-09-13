import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  Object3D,
  Points,
  PointsMaterial,
  Vector3,
} from 'three';

export interface ConfettiBurstConfig {
  count?: number;
  size?: number;
  colors?: number[];
  speed?: number;
  lifetime?: number;
}

interface ConfettiParticle {
  position: Vector3;
  velocity: Vector3;
  color: Color;
  age: number;
  maxAge: number;
}

/**
 * One-shot celebratory confetti burst that explodes radially with upward pop and gentle gravity drift.
 */
export class ConfettiBurst extends Object3D {
  private _geometry: BufferGeometry;
  private _material: PointsMaterial;
  private _points: Points;
  private _particles: ConfettiParticle[] = [];
  private _positionsArray: Float32Array;
  private _colorsArray: Float32Array;

  constructor(colors?: number[] | ConfettiBurstConfig, scaleMultiplier = 1.0) {
    super();

    const config: ConfettiBurstConfig = Array.isArray(colors) ? { colors } : (colors ?? {});

    const count = config.count ?? Math.round(34 * scaleMultiplier);
    const size = config.size ?? 0.13 * scaleMultiplier;
    const colorHexes = config.colors ?? [0xffd700, 0x00f0ff, 0xff007f, 0x00ff88, 0xff6600, 0xffffff];
    const colorList = colorHexes.map((hex) => new Color(hex));
    const speed = config.speed ?? 0.05;
    const maxLife = config.lifetime ?? 40;

    this._positionsArray = new Float32Array(count * 3);
    this._colorsArray = new Float32Array(count * 3);

    this._geometry = new BufferGeometry();
    this._geometry.setAttribute('position', new BufferAttribute(this._positionsArray, 3));
    this._geometry.setAttribute('color', new BufferAttribute(this._colorsArray, 3));

    this._material = new PointsMaterial({
      size,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });

    this._points = new Points(this._geometry, this._material);
    this.renderOrder = 999;
    this._points.renderOrder = 999;
    this.add(this._points);

    for (let i = 0; i < count; i++) {
      const angle = MathUtils.randFloat(0, Math.PI * 2);
      const spd = MathUtils.randFloat(speed * 0.6, speed * 1.4);
      const p: ConfettiParticle = {
        position: new Vector3(
          MathUtils.randFloatSpread(0.06),
          MathUtils.randFloatSpread(0.06),
          MathUtils.randFloatSpread(0.06),
        ),
        velocity: new Vector3(
          Math.cos(angle) * spd + MathUtils.randFloatSpread(0.015),
          Math.sin(angle) * spd + MathUtils.randFloat(0.02, 0.055),
          MathUtils.randFloatSpread(0.03),
        ),
        color: colorList[MathUtils.randInt(0, colorList.length - 1)].clone(),
        age: 0,
        maxAge: MathUtils.randInt(Math.floor(maxLife * 0.7), maxLife),
      };
      this._particles.push(p);
      this.writeParticle(i, p);
    }

    this._geometry.attributes['position'].needsUpdate = true;
    this._geometry.attributes['color'].needsUpdate = true;
  }

  public Update(): void {
    const count = this._particles.length;
    for (let i = 0; i < count; i++) {
      const p = this._particles[i];
      p.age++;
      if (p.age <= p.maxAge) {
        p.velocity.y -= 0.0016;
        p.velocity.x *= 0.95;
        p.velocity.z *= 0.95;
        p.position.add(p.velocity);
      }
      this.writeParticle(i, p);
    }
    this._geometry.attributes['position'].needsUpdate = true;
    this._geometry.attributes['color'].needsUpdate = true;
  }

  private writeParticle(index: number, p: ConfettiParticle): void {
    const i3 = index * 3;
    this._positionsArray[i3] = p.position.x;
    this._positionsArray[i3 + 1] = p.position.y;
    this._positionsArray[i3 + 2] = p.position.z;

    const fade = Math.max(0, 1 - p.age / p.maxAge);
    this._colorsArray[i3] = p.color.r * fade;
    this._colorsArray[i3 + 1] = p.color.g * fade;
    this._colorsArray[i3 + 2] = p.color.b * fade;
  }

  public Dispose(): void {
    this._geometry.dispose();
    this._material.dispose();
    this._particles = [];
  }
}
