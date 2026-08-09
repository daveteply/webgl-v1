import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSettings } from './user-settings';
import { MatDialogRef } from '@angular/material/dialog';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HapticsManagerService } from '../../../../../shared/services/haptics-manager';

describe('UserSettings', () => {
  let component: UserSettings;
  let fixture: ComponentFixture<UserSettings>;
  let hapticsManager: HapticsManagerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSettings],
      providers: [
        {
          provide: MatDialogRef,
          useValue: { close: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSettings);
    component = fixture.componentInstance;
    hapticsManager = TestBed.inject(HapticsManagerService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle haptics setting via hapticsManager', () => {
    const hapticsSpy = vi.spyOn(hapticsManager, 'HapticsEnabled', 'set');
    component.onHapticsChange(false);
    expect(hapticsSpy).toHaveBeenCalledWith(false);
  });
});
