import * as THREE from 'three';
import { Mesh } from 'three';
import { COLORS_256 } from '../wgl-constants';

export class MeshObj {
  private _tumble: THREE.Vector3;
  private _boxGeo: THREE.BoxGeometry;
  private _material: THREE.MeshStandardMaterial;
  private _mesh: THREE.Mesh;

  private readonly floatMin = -0.02;
  private readonly floatMax = 0.02;

  constructor(x: number, y: number, z: number) {
    this._tumble = new THREE.Vector3(
      THREE.MathUtils.randFloat(this.floatMin, this.floatMax),
      THREE.MathUtils.randFloat(this.floatMin, this.floatMax),
      THREE.MathUtils.randFloat(this.floatMin, this.floatMax)
    );

    this._boxGeo = new THREE.BoxGeometry();

    this._material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(
        COLORS_256[Math.floor(Math.random() * COLORS_256.length)].hexString
      ),
    });

    this._mesh = new Mesh(this._boxGeo, this._material);
    this._mesh.position.x = x;
    this._mesh.position.y = y;
    this._mesh.position.z = z;
  }

  public get Mesh(): THREE.Mesh {
    return this._mesh;
  }

  public get Tumble(): THREE.Vector3 {
    return this._tumble;
  }
}
