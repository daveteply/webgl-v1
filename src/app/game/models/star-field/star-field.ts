import {
  BufferGeometry as BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  Object3D,
  Points,
  PointsMaterial,
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

  constructor() {
    super();
    this._geometry = new BufferGeometry();
    this._geometry.setAttribute('position', new Float32BufferAttribute([], 3));
  }

  public InitParticles(): void {
    // texture
    const loader = new TextureLoader();
    loader.load('assets/particle.png', (sprite) => {
      sprite.name = 'sprite';
      sprite.center.set(0.5, 0.5);

      // material
      this._material = new PointsMaterial({
        map: sprite,
        size: 0.2,
        depthTest: true,
        depthWrite: false,
        transparent: true,
      });

      this._points = new Points(this._geometry, this._material);
      this.add(this._points);

      for (let i = 0; i < 1000; i++) {
        this._particles.push({
          position: new Vector3(
            MathUtils.randFloat(-10.0, 10.0),
            MathUtils.randFloat(-15.0, 15.0),
            MathUtils.randFloat(-10.0, 10.0)
          ),
          velocity: MathUtils.randFloat(0.005, 0.03),
        });
      }
    });
  }

  public UpdateParticles(): void {
    // update position
    this._particles.forEach((p) => {
      p.position.z += p.velocity;
      if (p.position.z >= 1.0) {
        p.position.z = -10;
      }
    });

    // update buffer geometry
    const positions = this._particles.flatMap((p) => [
      p.position.x,
      p.position.y,
      p.position.z,
    ]);
    this._geometry.setAttribute(
      'position',
      new Float32BufferAttribute(positions, 3)
    );
    this._geometry.attributes['position'].needsUpdate = true;
  }
}
