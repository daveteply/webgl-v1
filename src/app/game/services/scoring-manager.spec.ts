import { TestBed } from '@angular/core/testing';
import { ScoringManagerService } from './scoring-manager';
import { TextManagerService } from '../text/services/text-manager';
import { PowerMoveType } from '../models/power-move-type';

class MockTextManagerService {
  ShowText = () => undefined;
}

describe('ScoringManagerService', () => {
  let service: ScoringManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScoringManagerService, { provide: TextManagerService, useClass: MockTextManagerService }],
    });
    service = TestBed.inject(ScoringManagerService);
  });

  it('should be created with initial level 1 and score 0', () => {
    expect(service).toBeTruthy();
    expect(service.Level).toBe(1);
    expect(service.Score).toBe(0);
    expect(service.LevelProgress).toBe(0);
    expect(service.GameOver).toBe(false);
    expect(service.LevelComplete).toBe(false);
  });

  it('should increment level when IncLevel is called', () => {
    service.IncLevel();
    expect(service.Level).toBe(2);
  });

  it('should update level progress and piece counts correctly', () => {
    const target = service.LevelPieceTarget;
    expect(target).toBeGreaterThan(0);

    // Simulate level progress update
    service.UpdateLevelProgress();
    expect(service.LevelStats.pieceCount).toBe(1);
    expect(service.PiecesRemaining).toBe(target - 1);
    expect(service.LevelProgress).toBe((1 / target) * 100);
  });

  it('should decrement moves on UpdateMoveCount, emit MovesChange, and detect GameOver', () => {
    const initialMoves = service.PlayerMoves;
    expect(initialMoves).toBeGreaterThan(0);

    let movesChangedEmitted = false;
    service.MovesChange.subscribe((increase) => {
      movesChangedEmitted = true;
      expect(increase).toBe(false);
    });

    service.UpdateMoveCount();
    expect(service.PlayerMoves).toBe(initialMoves - 1);
    expect(movesChangedEmitted).toBe(true);

    // Force moves to 0
    while (service.PlayerMoves > 0) {
      service.UpdateMoveCount();
    }
    expect(service.GameOver).toBe(true);
  });

  it('should restart game and reset score, level to 1, and player moves to default', () => {
    service.StartSavedGame(5, 1500, 15);
    expect(service.Level).toBe(5);
    expect(service.Score).toBe(1500);
    expect(service.PlayerMoves).toBe(15);

    service.RestartGame();
    expect(service.Level).toBe(1);
    expect(service.Score).toBe(0);
    expect(service.LevelProgress).toBe(0);
    expect(service.PlayerMoves).toBe(3);
  });

  it('should initialize state correctly with StartSavedGame', () => {
    service.StartSavedGame(5, 1500, 12);

    expect(service.Level).toBe(5);
    expect(service.Score).toBe(1500);
    expect(service.PlayerMoves).toBe(12);
    expect(service.LevelProgress).toBe(0);
    expect(service.LevelPieceTarget).toBeGreaterThan(0);
    expect(service.PiecesRemaining).toBe(service.LevelPieceTarget);
  });

  it('should calculate bonus correctly for a single power move without awarding extra moves', () => {
    const textManager = TestBed.inject(TextManagerService);
    let capturedMessage: string[] = [];
    textManager.ShowText = (msg: string[]) => {
      capturedMessage = msg;
    };

    const initialMoves = service.PlayerMoves;
    const initialScore = service.Score;

    service.UpdatePowerMoveBonus(0, PowerMoveType.HorizontalRight);

    expect(service.Score).toBe(initialScore + 50);
    expect(service.PlayerMoves).toBe(initialMoves);
    expect(service.LevelStats.moveCountEarned).toBe(0);
    expect(capturedMessage).toEqual(['Spin right!', '+50 Points']);
  });

  it('should calculate bonus and award +1 move for multi-power move with 1 additional power move', () => {
    const textManager = TestBed.inject(TextManagerService);
    let capturedMessage: string[] = [];
    textManager.ShowText = (msg: string[]) => {
      capturedMessage = msg;
    };

    let movesChangeEmitted: boolean | undefined;
    service.MovesChange.subscribe((increase) => {
      movesChangeEmitted = increase;
    });

    const initialMoves = service.PlayerMoves;
    const initialScore = service.Score;

    service.UpdatePowerMoveBonus(1, PowerMoveType.HorizontalRight);

    expect(service.Score).toBe(initialScore + 100);
    expect(service.PlayerMoves).toBe(initialMoves + 1);
    expect(service.LevelStats.moveCountEarned).toBe(1);
    expect(movesChangeEmitted).toBe(true);
    expect(capturedMessage).toEqual(['Multi-Power!', '+1 Move', '+100 Points']);
  });

  it('should calculate bonus and award +2 moves for multi-power move with 2 additional power moves', () => {
    const textManager = TestBed.inject(TextManagerService);
    let capturedMessage: string[] = [];
    textManager.ShowText = (msg: string[]) => {
      capturedMessage = msg;
    };

    let movesChangeEmitted: boolean | undefined;
    service.MovesChange.subscribe((increase) => {
      movesChangeEmitted = increase;
    });

    const initialMoves = service.PlayerMoves;
    const initialScore = service.Score;

    service.UpdatePowerMoveBonus(2, PowerMoveType.VerticalUp);

    expect(service.Score).toBe(initialScore + 150);
    expect(service.PlayerMoves).toBe(initialMoves + 2);
    expect(service.LevelStats.moveCountEarned).toBe(2);
    expect(movesChangeEmitted).toBe(true);
    expect(capturedMessage).toEqual(['Multi-Power!', '+2 Moves', '+150 Points']);
  });

  describe('Perfect Match Scoring & StatsEntries', () => {
    it('should award perfect match bonus when piece count matches target exactly', () => {
      const target = service.LevelPieceTarget;
      for (let i = 0; i < target; i++) {
        service.UpdateLevelProgress();
      }
      expect(service.LevelComplete).toBe(true);
      expect(service.LevelStats.pieceCount).toBe(target);

      const initialScore = service.Score;
      const wasAwarded = service.CheckPerfectMatch();

      expect(wasAwarded).toBe(true);
      expect(service.LevelStats.perfectMatchBonus).toBe(100); // Level 1 * 100
      expect(service.Score).toBe(initialScore + 100);
    });

    it('should not award perfect match bonus if piece count exceeds target', () => {
      const target = service.LevelPieceTarget;
      for (let i = 0; i < target + 2; i++) {
        service.UpdateLevelProgress();
      }
      expect(service.LevelComplete).toBe(true);
      expect(service.LevelStats.pieceCount).toBe(target + 2);

      const wasAwarded = service.CheckPerfectMatch();
      expect(wasAwarded).toBe(false);
      expect(service.LevelStats.perfectMatchBonus).toBe(0);
    });

    it('should accurately calculate StatsEntries for dialog height', () => {
      // Initially no stats
      expect(service.StatsEntries()).toBe(0);

      // Perform a move
      service.UpdateMoveCount();
      expect(service.StatsEntries()).toBe(1); // moveCount

      // Clear a piece
      service.UpdateLevelProgress();
      expect(service.StatsEntries()).toBe(2); // moveCount + pieceCount

      // Award perfect match bonus
      const target = service.LevelPieceTarget;
      for (let i = 1; i < target; i++) {
        service.UpdateLevelProgress();
      }
      service.CheckPerfectMatch();
      expect(service.StatsEntries()).toBe(3); // moveCount + pieceCount + perfectMatchBonus
    });
  });
});
