import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

import { LevelComplete } from './level-complete';
import { UserSettings } from '../user-settings/user-settings';
import { provideTranslocoTesting } from '@rikkle/shared';
import { ShareManagerService } from '@rikkle/graphics';

describe('LevelComplete', () => {
  let component: LevelComplete;
  let fixture: ComponentFixture<LevelComplete>;
  let shareManager: ShareManagerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelComplete],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { level: 2 } },
        provideTranslocoTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LevelComplete);
    component = fixture.componentInstance;
    shareManager = TestBed.inject(ShareManagerService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open settings dialog', () => {
    const dialog = component['dialog'];
    const openSpy = vi.spyOn(dialog, 'open').mockReturnValue({} as unknown as MatDialogRef<UserSettings>);
    component.openSettings();
    expect(openSpy).toHaveBeenCalledWith(
      UserSettings,
      expect.objectContaining({
        minWidth: '20em',
        panelClass: ['wgl-pane-bounce'],
      }),
    );
  });

  it('should call ShareLevelComplete on Share()', () => {
    const shareSpy = vi.spyOn(shareManager, 'ShareLevelComplete').mockImplementation(() => undefined);
    component.Share();
    expect(shareSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 2,
      }),
      expect.anything(),
    );
  });
});
