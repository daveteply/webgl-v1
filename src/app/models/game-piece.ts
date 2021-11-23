import { BoxGeometry, MathUtils, Mesh, MeshStandardMaterial } from 'three';
import { GameMaterial } from './game-material';
import { PieceRemove } from './piece-remove';

export class GamePiece extends Mesh {
  private _material: MeshStandardMaterial;

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

  // TODO: create clean up for geometries and materials
  // TODO: create inner/outer geometries

  constructor(
    x: number,
    y: number,
    z: number,
    rotation: number,
    gameMaterial: GameMaterial
  ) {
    super(new BoxGeometry());

    this.position.set(x, y, z);
    this.rotateY(rotation);

    // grab a clone of the material so each
    //  game piece can manipulate it's own material
    this._material = gameMaterial.material.clone();
    this.material = this._material;

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
    this._pieceRemoval = new PieceRemove(MathUtils.randInt(100, 150));
  }

  public Remove(): void {
    if (this._pieceRemoval.HasNext) {
      // TODO: create the 'outer' and 'inner' game piece
      // this.translateX(this._pieceRemoval.Velocity);
      this._material.opacity -= this._pieceRemoval.OpacityRate;

      this._pieceRemoval.Next();
    } else {
      this.IsMatch = false;
      this.IsRemoved = true;
    }
  }
}
