import { GamePiece } from './game-piece';
import { PowerMoveType } from '../power-move-type';
import { LevelGeometryType } from '../../level-geometry-type';

describe('GamePiece', () => {
  it('should create an instance', () => {
    expect(new GamePiece(0, 0, 0, 0)).toBeTruthy();
  });

  it('should initialize power move correctly on PowerMoveAdd', () => {
    const piece = new GamePiece(0, 0, 0, 0);
    piece.PowerMoveAdd(PowerMoveType.HorizontalRight, 0xff0000, false);

    expect(piece.IsPowerMove).toBe(true);
    expect(piece.IsRemoved).toBe(false);
    expect(piece.PowerMoveType).toBe(PowerMoveType.HorizontalRight);
    expect(piece.PowerMove).toBeTruthy();
    expect(piece.PowerMove.PowerMoveColor).toBe(0xff0000);
  });

  it('should capture and restore power move in state snapshot', () => {
    const sourcePiece = new GamePiece(0, 0, 0, 0);
    sourcePiece.PowerMoveAdd(PowerMoveType.VerticalUp, 0x00ff00, false);

    const snapshot = sourcePiece.GetStateSnapshot();
    expect(snapshot.isPowerMove).toBe(true);
    expect(snapshot.powerMoveType).toBe(PowerMoveType.VerticalUp);
    expect(snapshot.powerMoveColor).toBe(0x00ff00);

    const targetPiece = new GamePiece(0, 0, 0, 0);
    targetPiece.ApplyStateSnapshot(snapshot);

    expect(targetPiece.IsPowerMove).toBe(true);
    expect(targetPiece.IsRemoved).toBe(false);
    expect(targetPiece.PowerMoveType).toBe(PowerMoveType.VerticalUp);
    expect(targetPiece.PowerMove?.PowerMoveColor).toBe(0x00ff00);
  });

  it('should update SlideOffsetY during AnimateGravitySlide on a power move piece', () => {
    const piece = new GamePiece(0, 0, 0, 0);
    piece.PowerMoveAdd(PowerMoveType.HorizontalLeft, 0x0000ff, false);

    const tween = piece.AnimateGravitySlide(10, 500);
    expect(piece.PowerMove.SlideOffsetY).toBe(10);
    expect(piece.IsRemoved).toBe(false);
    expect(tween).toBeTruthy();
  });

  it('should clean up power move on Reset', () => {
    const piece = new GamePiece(0, 0, 0, 0);
    piece.PowerMoveAdd(PowerMoveType.HorizontalMix, 0xffff00, false);
    expect(piece.IsPowerMove).toBe(true);

    piece.Reset(LevelGeometryType.Cube);
    expect(piece.IsPowerMove).toBe(false);
    expect(piece.PowerMove).toBeFalsy();
  });

  it('should initialize and snapshot Bomb power move with spark emitter', () => {
    const piece = new GamePiece(0, 0, 0, 0);
    piece.PowerMoveAdd(PowerMoveType.Bomb, 0xff5500, false);

    expect(piece.IsPowerMove).toBe(true);
    expect(piece.PowerMoveType).toBe(PowerMoveType.Bomb);
    expect(piece.PowerMove).toBeTruthy();
    expect(piece.PowerMove.PowerMoveMesh).toBeTruthy();

    const snapshot = piece.GetStateSnapshot();
    expect(snapshot.isPowerMove).toBe(true);
    expect(snapshot.powerMoveType).toBe(PowerMoveType.Bomb);

    const targetPiece = new GamePiece(0, 0, 0, 0);
    targetPiece.ApplyStateSnapshot(snapshot);
    expect(targetPiece.IsPowerMove).toBe(true);
    expect(targetPiece.PowerMoveType).toBe(PowerMoveType.Bomb);

    piece.PowerMoveRemove();
    expect(piece.IsRemoved).toBe(true);
    expect(piece.IsPowerMove).toBe(false);
  });
});
