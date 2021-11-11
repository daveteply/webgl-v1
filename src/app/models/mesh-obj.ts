import { BoxGeometry, BufferGeometry, Mesh, MeshStandardMaterial } from 'three';

export class MeshObj {
  // private _tumble: Vector3;
  private _boxGeo: BufferGeometry;
  private _mesh: Mesh;

  private readonly floatMin = -0.02;
  private readonly floatMax = 0.02;

  constructor(
    x: number,
    y: number,
    z: number,
    rotation: number,
    materials: MeshStandardMaterial[]
  ) {
    // this._tumble = new Vector3(
    //   MathUtils.randFloat(this.floatMin, this.floatMax),
    //   MathUtils.randFloat(this.floatMin, this.floatMax),
    //   MathUtils.randFloat(this.floatMin, this.floatMax)
    // );

    this._boxGeo = new BoxGeometry();

    // create mesh
    this._mesh = new Mesh(
      this._boxGeo,
      materials[Math.floor(Math.random() * materials.length)]
    );

    // position mesh
    this._mesh.position.set(x, y, z);
    this._mesh.rotateY(rotation);
  }

  public get Mesh(): Mesh {
    return this._mesh;
  }

  // public Tumble(): void {
  //   this._mesh.rotateX(this._tumble.x);
  //   this._mesh.rotateY(this._tumble.y);
  //   this._mesh.rotateZ(this._tumble.z);
  // }
}
