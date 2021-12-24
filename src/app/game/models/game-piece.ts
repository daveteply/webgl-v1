import { BoxGeometry, MathUtils, Mesh, Object3D } from 'three';
import { QUARTER_CIRCLE, TWO_PI } from '../game-constants';
import { GameMaterial } from './game-material';
import { Betweener } from './keyframes/betweener';
import { PieceRemove } from './keyframes/piece-remove';

export class GamePiece extends Object3D {
  private _innerGeometry: BoxGeometry;
  private _innerMaterials: GameMaterial[] = [];

  // visual game piece
  private _mesh: Mesh;

  // Original theta (angle) where the piece was drawn.
  // Used to help calculate the offset as the Wheel is moved.
  // This will eventually be used to understand if the piece is
  //   within the current view frustum.
  private _thetaStart: number;
  private _thetaOffset: number;

  // Each side material is arranged as follows:
  // 0 'back'
  // 1 'front'
  // 2 'top'
  // 3 'bottom'
  // The follow array is the sequence of side changes as the player
  //  flips.  This array will be shifted right or left based on
  //  flip direction.
  private _matchKeySequence: number[] = [1, 2, 0, 3];
  private _matchKey: number;

  private _flipBetweener!: Betweener;

  // for iterating over pieces checking for matches
  public Next!: GamePiece;
  public Prev!: GamePiece;

  public IsMatch: boolean = false;

  private _pieceRemoval!: PieceRemove;
  private _isRemoved: boolean = false;
  get IsRemoved(): boolean {
    return this._isRemoved;
  }

  constructor(
    x: number,
    y: number,
    z: number,
    rotation: number,
    gameMaterials: GameMaterial[]
  ) {
    super();

    // position shell in grid
    this.position.set(x, y, z);
    this.rotateY(rotation);

    // set up visual piece
    this._innerGeometry = new BoxGeometry();

    // materials
    this.initMaterials(gameMaterials);

    this._mesh = new Mesh(
      this._innerGeometry,
      this._innerMaterials.map((m) => m.material)
    );

    this.add(this._mesh);

    // interaction and matching values
    this._thetaStart = Math.abs(rotation);
    this._thetaOffset = this._thetaStart;

    // 1 is the default (or "front"), will change when piece is flipped
    this._matchKey = this._innerMaterials[this._matchKeySequence[0]].matchKey;
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
    if (!this._isRemoved) {
      this._innerMaterials.forEach(
        (m) => (m.material.opacity = lock ? 0.4 : 1.0)
      );
    }
  }

  public InitRemove(): void {
    this._pieceRemoval = new PieceRemove(MathUtils.randInt(30, 60));
  }

  public Remove(): void {
    if (this._pieceRemoval.HasNext) {
      this._innerMaterials.forEach(
        (m) => (m.material.opacity -= this._pieceRemoval.OpacityRate)
      );
      this._mesh.translateX(this._pieceRemoval.Velocity);
      this._mesh.rotateX(this._pieceRemoval.Tumble.x);
      this._mesh.rotateZ(this._pieceRemoval.Tumble.y);

      this._pieceRemoval.Next();
    } else {
      this.IsMatch = false;
      this._isRemoved = true;
    }
  }

  public InitFlip(directionUp: boolean): void {
    // calculate rotation steps
    const target = this.rotation.z + QUARTER_CIRCLE * (directionUp ? -1 : 1);
    this._flipBetweener = new Betweener(this.rotation.z, target, 15);

    // update match key
    this._matchKeySequence = this._matchKeySequence.concat(
      this._matchKeySequence.splice(
        0,
        directionUp ? this._matchKeySequence.length - 1 : 1
      )
    );
    this._matchKey = this._innerMaterials[this._matchKeySequence[0]].matchKey;
  }

  public Flip(): boolean {
    if (this._flipBetweener.HasNext) {
      this.rotation.z = this._flipBetweener.Next;
    }

    return this._flipBetweener.HasNext;
  }

  public Dispose(): void {
    this._innerMaterials.forEach((m) => m.material.dispose());
    this._innerGeometry.dispose();
  }

  private initMaterials(materials: GameMaterial[]): void {
    // initial index
    // 0 'back'
    // 1 'front'
    // 2 'top'
    // 3 'bottom'
    for (let i = 0; i < 6; i++) {
      const randMaterial =
        materials[Math.floor(Math.random() * materials.length)];
      this._innerMaterials.push({
        materialColorHex: randMaterial.materialColorHex,
        material: randMaterial.material.clone(),
        matchKey: randMaterial.matchKey,
      });
    }
  }

  private mod(a: number, n: number): number {
    return ((a % n) + n) % n;
  }
}
