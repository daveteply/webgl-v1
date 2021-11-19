import { BoxGeometry, Mesh } from 'three';
import { GameMaterial } from './game-material';

export class GamePiece extends Mesh {
  // Original theta (angle) where the peice was drawn.
  // Used to help calculate the offset as the Wheel is moved.
  // This will evetually be used to understand if the peice is
  //   within the current view frustum.
  private _thetaStart: number;
  private _thetaOffset: number;

  // for iterating over pieces checking for matches
  private _nextPiece!: GamePiece;
  private _prevPiece!: GamePiece;
  private _isMatch: boolean = false;

  private _gameMaterial: GameMaterial;

  constructor(
    x: number,
    y: number,
    z: number,
    rotation: number,
    gameMaterial: GameMaterial
  ) {
    super(new BoxGeometry(), gameMaterial.material);

    this.position.set(x, y, z);
    this.rotateY(rotation);

    this._thetaStart = rotation;
    this._thetaOffset = rotation;
    this._gameMaterial = gameMaterial;
  }

  set ThetaOffset(theta: number) {
    this._thetaOffset = this._thetaStart + theta;
  }
  get ThetaOffset(): number {
    return this._thetaOffset;
  }

  set Next(piece: GamePiece) {
    this._nextPiece = piece;
  }
  get Next(): GamePiece {
    return this._nextPiece;
  }

  set Prev(piece: GamePiece) {
    this._prevPiece = piece;
  }
  get Prev(): GamePiece {
    return this._prevPiece;
  }

  get MatchKey(): number {
    return this._gameMaterial.matchKey;
  }

  set IsMatch(isMatch: boolean) {
    this._isMatch = isMatch;
  }
  get IsMatch(): boolean {
    return this._isMatch;
  }
}
