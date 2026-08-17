import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Intro } from './intro';
import { SaveGameService } from '../../../../services/save-game/save-game';
import { AnalyticsEventType, AnalyticsManagerService } from '../../../../../shared/services/analytics-manager';

describe('Intro', () => {
  let component: Intro;
  let fixture: ComponentFixture<Intro>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let analyticsManager: AnalyticsManagerService;
  let mockSaveGameService: {
    HasSaveState: ReturnType<typeof vi.fn>;
    GetSaveState: ReturnType<typeof vi.fn>;
    ClearSaveState: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };
    mockSaveGameService = {
      HasSaveState: vi.fn().mockReturnValue(of(true)),
      GetSaveState: vi.fn().mockReturnValue({ level: 4, score: 2500, moves: 10 }),
      ClearSaveState: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Intro],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: SaveGameService, useValue: mockSaveGameService },
      ],
    }).compileComponents();

    analyticsManager = TestBed.inject(AnalyticsManagerService);
    vi.spyOn(analyticsManager, 'Log');

    fixture = TestBed.createComponent(Intro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create and load saved level when save state exists', () => {
    expect(component).toBeTruthy();
    expect(component.hasRestoreData()).toBe(true);
    expect(component.savedLevel()).toBe(4);
  });

  it('should close dialog with isContinue: true and log IntroDialogRestoreCTA on ContinueGame', () => {
    component.ContinueGame();
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.IntroDialogRestoreCTA,
      expect.objectContaining({ savedLevel: 4 }),
    );
    expect(mockDialogRef.close).toHaveBeenCalledWith({ isContinue: true });
  });

  it('should prompt confirmation and log IntroDialogNewGameCTA when clicking New Game with active save', () => {
    expect(component.confirmNewGame()).toBe(false);
    component.onNewGameClick();
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.IntroDialogNewGameCTA,
      expect.objectContaining({ hasRestoreData: true, savedLevel: 4 }),
    );
    expect(component.confirmNewGame()).toBe(true);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should clear save state and log IntroDialogConfirmNewGameCTA on confirmed new game', () => {
    component.onConfirmNewGame();
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.IntroDialogConfirmNewGameCTA,
      expect.objectContaining({ previousSavedLevel: 4 }),
    );
    expect(mockSaveGameService.ClearSaveState).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ isContinue: false });
  });

  it('should log IntroDialogCancelNewGameCTA and reset confirmation on cancel new game', () => {
    component.confirmNewGame.set(true);
    component.onCancelNewGame();
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.IntroDialogCancelNewGameCTA,
      expect.objectContaining({ savedLevel: 4 }),
    );
    expect(component.confirmNewGame()).toBe(false);
  });
});
