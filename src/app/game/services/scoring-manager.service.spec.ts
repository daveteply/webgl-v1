import { TestBed } from '@angular/core/testing';

import { ScoringManagerService } from './scoring-manager.service';

describe('ScoringManagerService', () => {
  let service: ScoringManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ScoringManagerService] });
    service = TestBed.inject(ScoringManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('long match', () => {
    beforeEach(() => {
      service.ResetStats();
    });
    describe('move count', () => {
      it('should calc 0 moves earned for minimum match count', () => {
        service.UpdateScore(3);
        expect(service.LevelStats.moveCountEarned).toBe(0);
      });
      it('should increase moves earned - 4', () => {
        service.UpdateScore(4);
        expect(service.LevelStats.moveCountEarned).toBe(1);
      });
      it('should increase moves earned - 5', () => {
        service.UpdateScore(5);
        expect(service.LevelStats.moveCountEarned).toBe(2);
      });
      it('should increase moves earned - 7', () => {
        service.UpdateScore(7);
        expect(service.LevelStats.moveCountEarned).toBe(3);
      });
    });
  });
});
