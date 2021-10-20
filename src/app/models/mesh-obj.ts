import * as THREE from 'three';
import { Mesh } from 'three';

export class MeshObj {
  private _tumble: THREE.Vector3;
  private _boxGeo: THREE.BoxGeometry;
  private _material: THREE.MeshStandardMaterial;
  private _mesh: THREE.Mesh;

  private readonly floatMin = 0.01;
  private readonly floatMax = 0.03;

  constructor() {
    this._tumble = new THREE.Vector3(
      THREE.MathUtils.randFloat(this.floatMin, this.floatMax),
      THREE.MathUtils.randFloat(this.floatMin, this.floatMax),
      THREE.MathUtils.randFloat(this.floatMin, this.floatMax)
    );

    this._boxGeo = new THREE.BoxGeometry();
    this._material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(Math.random() * 0xfffff),
    });

    this._mesh = new Mesh(this._boxGeo, this._material);
  }

  public get Mesh(): THREE.Mesh {
    return this._mesh;
  }

  public get Tumble(): THREE.Vector3 {
    return this._tumble;
  }
}
