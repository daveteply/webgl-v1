import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateStore } from './game-state.store';
import { LevelGeometryType } from '../models/level-geometry-type';
import { LevelMaterialType } from '../models/level-material-type';
import { GravityType } from '../models/gravity-type';
import { LevelOrientationType } from '../models/level-orientation-type';

describe('GameStateStore', () => {
  let store: GameStateStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameStateStore],
    });
    store = TestBed.inject(GameStateStore);
  });

  it('should initialize with default state values', () => {
    expect(store.level()).toBe(1);
    expect(store.score()).toBe(0);
    expect(store.movesRemaining()).toBe(3);
    expect(store.levelProgress()).toBe(0);
    expect(store.isGameOver()).toBe(false);
    expect(store.isLevelComplete()).toBe(false);
    expect(store.isHorizontal()).toBe(false);
  });

  it('should initialize level configuration correctly on initLevel', () => {
    store.initLevel(1);
    expect(store.level()).toBe(1);
    expect(store.levelGeometryType()).toBe(LevelGeometryType.Cube);
    expect(store.levelMaterialType()).toBe(LevelMaterialType.ColorBumpShape);
    expect(store.gravityType()).toBe(GravityType.None);
    expect(store.levelOrientation()).toBe(LevelOrientationType.Vertical);
    expect(store.gameStatus()).toBe('playing');
  });

  it('should update progress and detect level complete at 100%', () => {
    store.initLevel(1);
    const target = store.levelPieceTarget();
    expect(target).toBeGreaterThan(0);

    store.updateLevelProgress(target);
    expect(store.levelProgress()).toBe(100);
    expect(store.isLevelComplete()).toBe(true);
    expect(store.gameStatus()).toBe('level-complete');
  });

  it('should decrement moves and transition to game-over when moves reach 0', () => {
    store.initLevel(1);
    expect(store.movesRemaining()).toBe(3);
    expect(store.isWarningMoves()).toBe(true);
    expect(store.movesStatus()).toBe('warn');

    store.decrementMoves(); // 2 -> danger
    expect(store.movesRemaining()).toBe(2);
    expect(store.isDangerMoves()).toBe(true);
    expect(store.isPanicMoves()).toBe(false);
    expect(store.movesStatus()).toBe('danger');

    store.decrementMoves(); // 1 -> panic
    expect(store.movesRemaining()).toBe(1);
    expect(store.isPanicMoves()).toBe(true);
    expect(store.movesStatus()).toBe('panic');

    store.decrementMoves(); // 0 -> game over
    expect(store.movesRemaining()).toBe(0);
    expect(store.isGameOver()).toBe(true);
    expect(store.gameStatus()).toBe('game-over');
  });

  it('should calculate match score and speed bonus correctly', () => {
    store.initLevel(1);
    // Fast match in 500ms (speed bonus = ceil(1000/500 * 1000) = 2000)
    const result = store.recordMatchScore(3, 500);

    expect(result.speedBonus).toBe(2000);
    expect(result.earnedMoves).toBe(1);
    // Base score = 3 * 1 = 3 + 2000 = 2003
    expect(result.scoreDelta).toBe(2003);
    expect(store.score()).toBe(2003);
    expect(store.movesRemaining()).toBe(4); // 3 initial + 1 earned
  });

  it('should calculate long match bonuses for pieceCount > 3', () => {
    store.initLevel(1);
    // Slow match in 5000ms (no speed bonus), pieceCount = 10
    const result = store.recordMatchScore(10, 5000);

    expect(result.speedBonus).toBe(0);
    expect(result.longMatchBonus).toBeGreaterThan(0);
    expect(result.earnedMoves).toBeGreaterThan(0);
    expect(store.score()).toBe(result.scoreDelta);
  });

  it('should award power move score bonuses and additional moves', () => {
    store.initLevel(2);
    const initialScore = store.score();
    const initialMoves = store.movesRemaining();

    const bonus = store.recordPowerMoveBonus(2); // level 2 * 50 * (2 + 1) = 300
    expect(bonus).toBe(300);
    expect(store.score()).toBe(initialScore + 300);
    expect(store.movesRemaining()).toBe(initialMoves + 2);
  });

  it('should award perfect match bonus when completed exactly on target', () => {
    store.initLevel(2);
    const target = store.levelPieceTarget();
    store.updateLevelProgress(target);

    const awarded = store.checkPerfectMatch();
    expect(awarded).toBe(true);
    // level 2 * 100 = 200
    expect(store.levelStats().perfectMatchBonus).toBe(200);

    // Second check should not award again
    const secondCheck = store.checkPerfectMatch();
    expect(secondCheck).toBe(false);
  });

  it('should restart game and reset all state', () => {
    store.initLevel(5);
    store.addScore(5000);
    store.decrementMoves();

    store.restartGame();
    expect(store.level()).toBe(1);
    expect(store.score()).toBe(0);
    expect(store.movesRemaining()).toBe(3);
    expect(store.levelProgress()).toBe(0);
    expect(store.gameStatus()).toBe('playing');
  });
});
