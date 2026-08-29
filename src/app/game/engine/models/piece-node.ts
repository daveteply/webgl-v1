import { PowerMoveType } from '../../models/power-move-type';

export interface IPieceNode {
  readonly id?: number;
  readonly matchKey: number;
  readonly thetaOffset: number;
  isMatch: boolean;
  readonly isRemoved: boolean;
  readonly isPowerMove: boolean;
  readonly powerMoveType?: PowerMoveType;
  readonly next?: IPieceNode;
  readonly prev?: IPieceNode;
  readonly parentWheel?: IWheelNode;
}

export interface IWheelNode {
  readonly wheelIndex?: number;
  readonly pieces: readonly IPieceNode[];
  readonly above?: IWheelNode;
  readonly below?: IWheelNode;
}

export interface IBoardGrid {
  readonly wheels: readonly IWheelNode[];
}
