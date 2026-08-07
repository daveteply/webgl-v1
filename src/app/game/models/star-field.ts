import {
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  Object3D,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from 'three';

export interface Particle {
  position: Vector3;
  velocity: number;
}

export class StarField extends Object3D {
  private _material!: PointsMaterial;

  private _geometry: BufferGeometry;
  private _points!: Points;
  private _particles: Particle[] = [];

  private _zLimit: number;

  constructor() {
    super();
    this._geometry = new BufferGeometry();
    this._geometry.setAttribute('position', new Float32BufferAttribute([], 3));
    this._zLimit = 1.0;
  }

  public InitParticles(): void {
    // texture
    const loader = new TextureLoader();
    loader.load('assets/particle.webp', (sprite) => {
      sprite.name = 'sprite';
      sprite.center.set(0.5, 0.5);
      sprite.colorSpace = SRGBColorSpace;

      // material
      this._material = new PointsMaterial({
        map: sprite,
        size: 0.23,
        depthTest: true,
        depthWrite: false,
        transparent: true,
      });

      const particleCount = 900;
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const p: Particle = {
          position: new Vector3(
            MathUtils.randFloat(-10.0, 10.0),
            MathUtils.randFloat(-15.0, 15.0),
            MathUtils.randFloat(-8.0, 8.0),
          ),
          velocity: MathUtils.randFloat(0.005, 0.03),
        };
        this._particles.push(p);

        const idx = i * 3;
        positions[idx] = p.position.x;
        positions[idx + 1] = p.position.y;
        positions[idx + 2] = p.position.z;
      }

      this._geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      this._points = new Points(this._geometry, this._material);
      this.add(this._points);
    });
  }

  public UpdateParticles(): void {
    const posAttr = this._geometry.getAttribute('position') as Float32BufferAttribute;
    if (!posAttr) return;

    const array = posAttr.array as Float32Array;

    // update position in-place without creating garbage
    for (let i = 0; i < this._particles.length; i++) {
      const p = this._particles[i];
      p.position.z += p.velocity;
      if (p.position.z >= this._zLimit) {
        p.position.z = -8;
      }
      array[i * 3 + 2] = p.position.z;
    }

    posAttr.needsUpdate = true;
  }

  public UpdateColor(starColor: number): void {
    if (this._material) {
      this._material.color.set(starColor);
    }
  }
}
