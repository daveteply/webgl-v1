import {
  BoxGeometry,
  BufferGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from 'three';

export class GamePiece extends Object3D {
  private _boxGeo: BufferGeometry;
  private _mesh: Mesh;

  constructor(
    x: number,
    y: number,
    z: number,
    rotation: number,
    materials: MeshStandardMaterial[]
  ) {
    super();

    // geometry
    this._boxGeo = new BoxGeometry();

    // mesh
    this._mesh = new Mesh(
      this._boxGeo,
      materials[Math.floor(Math.random() * materials.length)]
    );
    this._mesh.position.set(x, y, z);
    this._mesh.rotateY(rotation);
  }

  public get Mesh(): Mesh {
    return this._mesh;
  }
}
