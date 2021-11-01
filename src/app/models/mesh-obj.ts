import {
  BoxGeometry,
  Color,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three';
import { COLORS_256 } from '../wgl-constants';

export class MeshObj {
  private _tumble: Vector3;
  private _boxGeo: BoxGeometry;
  private _material: MeshStandardMaterial;
  private _mesh: Mesh;

  private readonly floatMin = -0.02;
  private readonly floatMax = 0.02;

  constructor(x: number, y: number, z: number) {
    this._tumble = new Vector3(
      MathUtils.randFloat(this.floatMin, this.floatMax),
      MathUtils.randFloat(this.floatMin, this.floatMax),
      MathUtils.randFloat(this.floatMin, this.floatMax)
    );

    this._boxGeo = new BoxGeometry();

    this._material = new MeshStandardMaterial({
      color: new Color(
        COLORS_256[Math.floor(Math.random() * COLORS_256.length)].hexString
      ),
    });

    this._mesh = new Mesh(this._boxGeo, this._material);
    this._mesh.position.x = x;
    this._mesh.position.y = y;
    this._mesh.position.z = z;
  }

  public get Mesh(): Mesh {
    return this._mesh;
  }

  public Tumble(): void {
    this._mesh.rotateX(this._tumble.x);
    this._mesh.rotateY(this._tumble.y);
    this._mesh.rotateZ(this._tumble.z);
  }
}
