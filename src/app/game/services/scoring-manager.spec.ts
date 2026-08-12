import { TestBed } from '@angular/core/testing';
import { ScoringManagerService } from './scoring-manager';
import { TextManagerService } from '../text/services/text-manager';

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

  it('should restart game and reset score and level to 1', () => {
    service.IncLevel();
    service.UpdateScore(5, true);
    expect(service.Level).toBe(2);
    expect(service.Score).toBeGreaterThan(0);

    service.RestartGame();
    expect(service.Level).toBe(1);
    expect(service.Score).toBe(0);
    expect(service.LevelProgress).toBe(0);
  });

  it('should restore state from SaveGameScore data', () => {
    const restoreData = {
      level: 5,
      moves: 12,
      remaining: 4,
      progress: 60,
      pieceTarget: 10,
      score: 1500,
      stats: {
        fastestMatchTime: 500,
        fastMatchBonusTotal: 200,
        moveCount: 8,
        moveCountEarned: 2,
        pieceCount: 6,
      },
    };

    service.Restore(restoreData);

    expect(service.Level).toBe(5);
    expect(service.PlayerMoves).toBe(12);
    expect(service.PiecesRemaining).toBe(4);
    expect(service.LevelProgress).toBe(60);
    expect(service.LevelPieceTarget).toBe(10);
    expect(service.Score).toBe(1500);
  });
});
