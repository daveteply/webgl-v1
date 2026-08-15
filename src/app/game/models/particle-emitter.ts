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

export interface ParticleEmitterConfig {
  count?: number;
  size?: number;
  colors?: number[];
  spread?: number;
  speed?: number;
  lifetime?: number;
}

interface ParticleState {
  position: Vector3;
  velocity: Vector3;
  color: Color;
  age: number;
  maxAge: number;
  baseSize: number;
}

export class ParticleEmitter extends Object3D {
  private _geometry: BufferGeometry;
  private _material: PointsMaterial;
  private _points: Points;
  private _particles: ParticleState[] = [];
  private _colors: Color[] = [];
  private _config: Required<ParticleEmitterConfig>;

  private _positionsArray: Float32Array;
  private _colorsArray: Float32Array;

  constructor(config?: ParticleEmitterConfig) {
    super();

    this._config = {
      count: config?.count ?? 12,
      size: config?.size ?? 0.08,
      colors: config?.colors ?? [0xffcc00, 0xff6600, 0xff2200, 0xffffff],
      spread: config?.spread ?? 0.04,
      speed: config?.speed ?? 0.015,
      lifetime: config?.lifetime ?? 25,
    };

    this._colors = this._config.colors.map((hex) => new Color(hex));

    const count = this._config.count;
    this._positionsArray = new Float32Array(count * 3);
    this._colorsArray = new Float32Array(count * 3);

    this._geometry = new BufferGeometry();
    this._geometry.setAttribute('position', new BufferAttribute(this._positionsArray, 3));
    this._geometry.setAttribute('color', new BufferAttribute(this._colorsArray, 3));

    this._material = new PointsMaterial({
      size: this._config.size,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    this._points = new Points(this._geometry, this._material);
    this.add(this._points);

    this.initParticles();
  }

  private initParticles(): void {
    for (let i = 0; i < this._config.count; i++) {
      const p = this.createParticle();
      // Stagger initial ages so they don't all respawn at once
      p.age = MathUtils.randInt(0, p.maxAge);
      this._particles.push(p);
      this.writeParticleToArrays(i, p);
    }
    this._geometry.attributes['position'].needsUpdate = true;
    this._geometry.attributes['color'].needsUpdate = true;
  }

  private createParticle(): ParticleState {
    const color = this._colors[MathUtils.randInt(0, this._colors.length - 1)].clone();
    const spread = this._config.spread;
    const speed = this._config.speed;

    return {
      position: new Vector3(
        MathUtils.randFloatSpread(spread),
        MathUtils.randFloatSpread(spread),
        MathUtils.randFloatSpread(spread),
      ),
      velocity: new Vector3(
        MathUtils.randFloatSpread(speed),
        MathUtils.randFloat(speed * 0.5, speed * 2.0),
        MathUtils.randFloatSpread(speed),
      ),
      color,
      age: 0,
      maxAge: MathUtils.randInt(Math.floor(this._config.lifetime * 0.6), this._config.lifetime),
      baseSize: this._config.size,
    };
  }

  private writeParticleToArrays(index: number, p: ParticleState): void {
    const i3 = index * 3;
    this._positionsArray[i3] = p.position.x;
    this._positionsArray[i3 + 1] = p.position.y;
    this._positionsArray[i3 + 2] = p.position.z;

    const progress = p.age / p.maxAge;
    const fade = Math.max(0, 1 - progress);

    this._colorsArray[i3] = p.color.r * fade;
    this._colorsArray[i3 + 1] = p.color.g * fade;
    this._colorsArray[i3 + 2] = p.color.b * fade;
  }

  public Update(): void {
    const count = this._particles.length;
    for (let i = 0; i < count; i++) {
      const p = this._particles[i];
      p.age++;

      if (p.age >= p.maxAge) {
        // Respawn particle at emitter origin with new velocity/color
        const newP = this.createParticle();
        p.position.copy(newP.position);
        p.velocity.copy(newP.velocity);
        p.color.copy(newP.color);
        p.age = 0;
        p.maxAge = newP.maxAge;
      } else {
        p.position.add(p.velocity);
      }

      this.writeParticleToArrays(i, p);
    }

    this._geometry.attributes['position'].needsUpdate = true;
    this._geometry.attributes['color'].needsUpdate = true;
  }

  public Dispose(): void {
    this._geometry.dispose();
    this._material.dispose();
    this._particles = [];
  }
}
