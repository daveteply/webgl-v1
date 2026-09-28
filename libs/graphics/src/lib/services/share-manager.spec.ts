import { TestBed } from '@angular/core/testing';
import { provideTranslocoTesting } from '@rikkle/shared';

import { ShareManagerService } from './share-manager';

describe('ShareManagerService', () => {
  let service: ShareManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTranslocoTesting()],
    });
    service = TestBed.inject(ShareManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit ShareInitiated and ShareFailed events via Subject', () => {
    let initiated = false;
    let failed = false;

    service.ShareInitiated.subscribe(() => {
      initiated = true;
    });

    service.ShareFailed.subscribe(() => {
      failed = true;
    });

    service.ShareInitiated.next();
    service.ShareFailed.next();

    expect(initiated).toBe(true);
    expect(failed).toBe(true);
  });

  it('should report CanShare observable', () => {
    let result = false;
    service.CanShare().subscribe((canShare: boolean) => {
      result = canShare;
    });
    expect(typeof result).toBe('boolean');
  });

  it('should update InLevel signal', () => {
    expect(service.InLevel).toBe(false);
    service.UpdateInLevel(true);
    expect(service.InLevel).toBe(true);
  });

  it('should manage level snapshot lifecycle', () => {
    expect(service.LevelSnapshotRequested).toBe(false);
    expect(service.CachedLevelSnapshotDataUrl).toBeUndefined();

    service.CaptureLevelSnapshot();
    expect(service.LevelSnapshotRequested).toBe(true);

    service.UpdateScreenShotData('data:image/png;base64,mockframe');
    expect(service.LevelSnapshotRequested).toBe(false);
    expect(service.CachedLevelSnapshotDataUrl).toBe('data:image/png;base64,mockframe');

    service.ClearLevelSnapshot();
    expect(service.CachedLevelSnapshotDataUrl).toBeUndefined();
  });

  it('should call createLevelCompleteVictoryCard on ShareLevelComplete', () => {
    const spy = vi
      .spyOn(
        service as unknown as { createLevelCompleteVictoryCard: () => Promise<void> },
        'createLevelCompleteVictoryCard',
      )
      .mockImplementation(() => Promise.resolve());

    // Mock _rikkleLogo so loadRikkleLogo resolves synchronously
    (service as unknown as { _rikkleLogo: HTMLImageElement })._rikkleLogo = new Image();

    service.ShareLevelComplete({
      level: 2,
      score: 4200,
      fastestMatchTime: 1200,
      fastMatchBonusTotal: 300,
      moveCount: 12,
      moveCountEarned: 2,
      pieceCount: 28,
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 2,
        score: 4200,
        fastestMatchTime: 1200,
        fastMatchBonusTotal: 300,
        moveCount: 12,
        moveCountEarned: 2,
        pieceCount: 28,
      }),
      true,
    );
  });
});
