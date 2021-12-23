import { BoxGeometry, Material, MathUtils, Mesh, Object3D } from 'three';
import { TWO_PI } from '../game-constants';
import { GameMaterial } from './game-material';
import { PieceRemove } from './keyframes/piece-remove';

export class GamePiece extends Object3D {
  private _innerGeometry: BoxGeometry;
  private _innerMaterial: Material;

  // visual game piece
  private _mesh: Mesh;

  // Original theta (angle) where the piece was drawn.
  // Used to help calculate the offset as the Wheel is moved.
  // This will eventually be used to understand if the piece is
  //   within the current view frustum.
  private _thetaStart: number;
  private _thetaOffset: number;

  private _matchKey: number;

  // private _flipTweener!: Betweener;

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

    // position shell in grid
    this.position.set(x, y, z);
    this.rotateY(rotation);

    // set up visual piece
    this._innerGeometry = new BoxGeometry();

    // grab a clone of the material so each
    //  game piece can manipulate it's own material
    this._innerMaterial = gameMaterial.material?.clone();

    this._mesh = new Mesh(this._innerGeometry, this._innerMaterial);
    //this._mesh.translateX(0.01);

    this.add(this._mesh);

    // interaction and matching values
    this._thetaStart = Math.abs(rotation);
    this._thetaOffset = this._thetaStart;
    this._matchKey = gameMaterial.matchKey;
  }

  set ThetaOffset(theta: number) {
    this._thetaOffset = this.mod(this._thetaStart - theta, TWO_PI);
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
      this._innerMaterial.opacity = lock ? 0.4 : 1.0;
    }
  }

  public InitRemove(): void {
    this._pieceRemoval = new PieceRemove(MathUtils.randInt(30, 60));
  }

  public Remove(): void {
    if (this._pieceRemoval.HasNext) {
      this._innerMaterial.opacity -= this._pieceRemoval.OpacityRate;
      this._mesh.translateX(this._pieceRemoval.Velocity);
      this._mesh.rotateX(this._pieceRemoval.Tumble.x);
      this._mesh.rotateZ(this._pieceRemoval.Tumble.y);

      this._pieceRemoval.Next();
    } else {
      this.IsMatch = false;
      this.IsRemoved = true;
    }
  }

  public Dispose(): void {
    this._innerMaterial.dispose();
    this._innerGeometry.dispose();
  }

  private mod(a: number, n: number): number {
    return ((a % n) + n) % n;
  }
}
