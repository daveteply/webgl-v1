import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { GameMenu } from './game-menu';
import { InstallPwaDialog } from '../dialogs/components/install-pwa/install-pwa';
import { UserSettings } from '../dialogs/components/user-settings/user-settings';
import { About } from '../../../shared/components/about/about';
import { AnalyticsEventType, AnalyticsManagerService } from '../../../shared/services/analytics-manager';

describe('GameMenu', () => {
  let component: GameMenu;
  let fixture: ComponentFixture<GameMenu>;
  let analyticsManager: AnalyticsManagerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameMenu],
      providers: [
        {
          provide: MatDialog,
          useValue: {
            open: () => ({ afterClosed: () => of(true) }),
          },
        },
      ],
    }).compileComponents();

    analyticsManager = TestBed.inject(AnalyticsManagerService);
    vi.spyOn(analyticsManager, 'Log');

    fixture = TestBed.createComponent(GameMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log GameMenuAboutCTA and open dialog when AboutClick is called', () => {
    const dialog = component['dialog'];
    const openSpy = vi
      .spyOn(dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(true) } as unknown as MatDialogRef<About>);
    component.AboutClick();
    expect(analyticsManager.Log).toHaveBeenCalledWith(AnalyticsEventType.GameMenuAboutCTA);
    expect(openSpy).toHaveBeenCalled();
  });

  it('should log GameMenuSettingsCTA and open dialog when SettingsClick is called', () => {
    const dialog = component['dialog'];
    const openSpy = vi
      .spyOn(dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(true) } as unknown as MatDialogRef<UserSettings>);
    component.SettingsClick();
    expect(analyticsManager.Log).toHaveBeenCalledWith(AnalyticsEventType.GameMenuSettingsCTA);
    expect(openSpy).toHaveBeenCalled();
  });

  it('should open install pwa dialog and log GameMenuInstallAppCTA when InstallAppClick is called', async () => {
    const dialog = component['dialog'];
    const openSpy = vi
      .spyOn(dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(true) } as unknown as MatDialogRef<InstallPwaDialog>);
    await component.InstallAppClick();
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.GameMenuInstallAppCTA,
      expect.objectContaining({ canInstall: expect.any(Boolean) }),
    );
    expect(openSpy).toHaveBeenCalled();
  });
});
