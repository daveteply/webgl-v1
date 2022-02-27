import {
  BufferGeometry as BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  Object3D,
  Points,
  PointsMaterial,
  Texture,
  TextureLoader,
  Vector3,
} from 'three';

export interface Particle {
  position: Vector3;
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
        color: 0x00ff00,
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
        });
      }
    });
  }

  public UpdateParticles(): void {
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
