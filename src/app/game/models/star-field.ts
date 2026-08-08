import {
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  Object3D,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Texture,
  TextureLoader,
  Vector3,
} from 'three';

export interface Particle {
  position: Vector3;
  velocity: number;
}

interface SporadicObject {
  sprite: Sprite;
  velocity: number;
  rotSpeed: number;
}

type ObjectType = 'rock' | 'ship' | 'planet';

export class StarField extends Object3D {
  private _material!: PointsMaterial;

  private _geometry: BufferGeometry;
  private _points!: Points;
  private _particles: Particle[] = [];

  private _zLimit: number;

  private _sporadicTextures: Map<ObjectType, Texture> = new Map();
  private _sporadicObjects: SporadicObject[] = [];
  private _frameCount = 0;
  private _nextSporadicFrame = 300;
  private _maxSporadicObjects = 3;

  constructor() {
    super();
    this._geometry = new BufferGeometry();
    this._geometry.setAttribute('position', new Float32BufferAttribute([], 3));
    this._zLimit = 1.0;
  }

  public InitParticles(): void {
    // texture
    const loader = new TextureLoader();
    loader.load('assets/star-field/star.webp', (sprite) => {
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

    // Preload sporadic object textures (rock, ship, planet)
    const sporadicTypes: ObjectType[] = ['rock', 'ship', 'planet'];
    for (const type of sporadicTypes) {
      loader.load(`assets/star-field/${type}.webp`, (tex) => {
        tex.colorSpace = SRGBColorSpace;
        this._sporadicTextures.set(type, tex);
      });
    }
  }

  private _spawnSporadicObject(): void {
    if (this._sporadicTextures.size === 0) return;

    const availableTypes = Array.from(this._sporadicTextures.keys());
    const type = availableTypes[MathUtils.randInt(0, availableTypes.length - 1)];
    const texture = this._sporadicTextures.get(type);
    if (!texture) return;

    let size = 0.25;
    if (type === 'planet') {
      size = MathUtils.randFloat(0.3, 0.5);
    } else if (type === 'rock') {
      size = MathUtils.randFloat(0.18, 0.3);
    } else if (type === 'ship') {
      size = MathUtils.randFloat(0.18, 0.3);
    }

    const material = new SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      rotation: MathUtils.randFloat(0, Math.PI * 2),
    });

    const sprite = new Sprite(material);
    sprite.scale.set(size, size, 1);
    sprite.position.set(
      MathUtils.randFloat(-3.5, 3.5),
      MathUtils.randFloat(-5.0, 5.0),
      MathUtils.randFloat(-10.0, -8.0),
    );

    const sporadicObj: SporadicObject = {
      sprite,
      velocity: MathUtils.randFloat(0.008, 0.02),
      rotSpeed: MathUtils.randFloat(-0.08, 0.08),
    };

    this._sporadicObjects.push(sporadicObj);
    this.add(sprite);
  }

  public UpdateParticles(): void {
    const posAttr = this._geometry.getAttribute('position') as Float32BufferAttribute;
    if (posAttr) {
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

    // Sporadic object spawning check
    this._frameCount++;
    if (this._frameCount >= this._nextSporadicFrame && this._sporadicObjects.length < this._maxSporadicObjects) {
      this._spawnSporadicObject();
      this._frameCount = 0;
      this._nextSporadicFrame = MathUtils.randInt(400, 900);
    }

    // Update active sporadic objects
    for (let i = this._sporadicObjects.length - 1; i >= 0; i--) {
      const obj = this._sporadicObjects[i];
      obj.sprite.position.z += obj.velocity;
      obj.sprite.material.rotation += obj.rotSpeed;

      if (obj.sprite.position.z >= this._zLimit) {
        this.remove(obj.sprite);
        obj.sprite.material.dispose();
        this._sporadicObjects.splice(i, 1);
      }
    }
  }

  public UpdateColor(starColor: number): void {
    if (this._material) {
      this._material.color.set(starColor);
    }
  }
}
