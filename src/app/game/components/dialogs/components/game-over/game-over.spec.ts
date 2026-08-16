import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

import { GameOver } from './game-over';

describe('GameOver', () => {
  let component: GameOver;
  let fixture: ComponentFixture<GameOver>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [GameOver],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { level: 3, startOver: false } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameOver);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create and detect level > 1', () => {
    expect(component).toBeTruthy();
    expect(component.isLevelOne()).toBe(false);
  });

  it('should prompt confirmation on onCloseGameOver when level > 1', () => {
    expect(component.confirmStartOver()).toBe(false);
    component.onCloseGameOver();
    expect(component.confirmStartOver()).toBe(true);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog with startOver: true on confirmed start over', () => {
    component.onConfirmStartOver();
    expect(mockDialogRef.close).toHaveBeenCalledWith(expect.objectContaining({ startOver: true }));
  });

  it('should close dialog with startOver: false on restart level', () => {
    component.onCloseRestartLevel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(expect.objectContaining({ startOver: false }));
  });
});
