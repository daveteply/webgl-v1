import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

import { GameOver } from './game-over';
import { AnalyticsEventType, AnalyticsManagerService } from '../../../../../shared/services/analytics-manager';

describe('GameOver', () => {
  let component: GameOver;
  let fixture: ComponentFixture<GameOver>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let analyticsManager: AnalyticsManagerService;

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [GameOver],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { level: 3, startOver: false } },
      ],
    }).compileComponents();

    analyticsManager = TestBed.inject(AnalyticsManagerService);
    vi.spyOn(analyticsManager, 'Log');

    fixture = TestBed.createComponent(GameOver);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create and log GameOverDialogViewed and detect level > 1', () => {
    expect(component).toBeTruthy();
    expect(component.isLevelOne()).toBe(false);
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.GameOverDialogViewed,
      expect.objectContaining({ level: 3, isLevelOne: false }),
    );
  });

  it('should prompt confirmation and log GameOverStartOverCTA on onCloseGameOver when level > 1', () => {
    expect(component.confirmStartOver()).toBe(false);
    component.onCloseGameOver();
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.GameOverStartOverCTA,
      expect.objectContaining({ level: 3, isLevelOne: false }),
    );
    expect(component.confirmStartOver()).toBe(true);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog with startOver: true and log GameOverConfirmStartOverCTA on confirmed start over', () => {
    component.onConfirmStartOver();
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.GameOverConfirmStartOverCTA,
      expect.objectContaining({ level: 3 }),
    );
    expect(mockDialogRef.close).toHaveBeenCalledWith(expect.objectContaining({ startOver: true }));
  });

  it('should log GameOverCancelStartOverCTA and reset confirmStartOver on cancel start over', () => {
    component.confirmStartOver.set(true);
    component.onCancelStartOver();
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.GameOverCancelStartOverCTA,
      expect.objectContaining({ level: 3 }),
    );
    expect(component.confirmStartOver()).toBe(false);
  });

  it('should close dialog with startOver: false and log GameOverRestartLevelCTA on restart level', () => {
    component.onCloseRestartLevel();
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.GameOverRestartLevelCTA,
      expect.objectContaining({ level: 3 }),
    );
    expect(mockDialogRef.close).toHaveBeenCalledWith(expect.objectContaining({ startOver: false }));
  });
});
