import {
  BoxGeometry,
  BufferGeometry,
  Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import { GameMaterial } from './game-material';
import { PieceRemove } from './piece-remove';

export class GamePiece extends Mesh {
  // "Shell" is the containing box geometry for interaction.
  //  Allows the "inner" to be any geometry, etc.
  private _shellMaterial!: Material;
  private _material: Material;
  private _shellGeometry!: BoxGeometry;
  private _geometry: BufferGeometry;

  // visual game piece
  private _mesh: Mesh;

  // Original theta (angle) where the piece was drawn.
  // Used to help calculate the offset as the Wheel is moved.
  // This will eventually be used to understand if the piece is
  //   within the current view frustum.
  private _thetaStart: number;
  private _thetaOffset: number;

  private _matchKey: number;

  // for iterating over pieces checking for matches
  public Next!: GamePiece;
  public Prev!: GamePiece;

  public IsMatch: boolean = false;

  private _pieceRemoval!: PieceRemove;
  public IsRemoved: boolean = false;

  constructor(
    x: number,
    y: number,
    z: number,
    rotation: number,
    gameMaterial: GameMaterial
  ) {
    super();

    this.initShell();

    // position shell in grid
    this.position.set(x, y, z);
    this.rotateY(rotation);

    // set up visual piece
    this._geometry = new BoxGeometry();

    // grab a clone of the material so each
    //  game piece can manipulate it's own material
    this._material = gameMaterial.material.clone();

    this._mesh = new Mesh(this._geometry, this._material);
    // TODO: Why is this needed in order to see the mesh?
    this._mesh.translateX(0.01);

    this.add(this._mesh);

    // interaction and matching values
    this._thetaStart = rotation;
    this._thetaOffset = rotation;
    this._matchKey = gameMaterial.matchKey;
  }

  set ThetaOffset(theta: number) {
    this._thetaOffset = this._thetaStart + theta;
  }
  get ThetaOffset(): number {
    return this._thetaOffset;
  }

  get MatchKey(): number {
    return this._matchKey;
  }

  public LockPiece(lock: boolean): void {
    // TODO keyframes
    if (!this.IsRemoved) {
      this._material.opacity = lock ? 0.4 : 1.0;
    }
  }

  public InitRemove(): void {
    this._pieceRemoval = new PieceRemove(MathUtils.randInt(30, 60));
  }

  public Remove(): void {
    if (this._pieceRemoval.HasNext) {
      this._material.opacity -= this._pieceRemoval.OpacityRate;
      this._pieceRemoval.Next();
    } else {
      this.IsMatch = false;
      this.IsRemoved = true;
    }
  }

  public CleanUp(): void {
    //TODO: test and use
    this._shellMaterial.dispose();
    this._material.dispose();
    this._shellGeometry.dispose();
    this._geometry.dispose();
  }

  private initShell(): void {
    this._shellMaterial = new MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    });
    this.material = this._shellMaterial;
    const scale = 1.05;
    this._shellGeometry = new BoxGeometry(scale, scale, scale);
    this.geometry = this._shellGeometry;
  }
}
