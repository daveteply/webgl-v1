import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { AnalyticsEventType, AnalyticsManagerService } from '../../../shared/services/analytics-manager';
import { NotifyService } from '../../../shared/services/notify';
import { ShareManagerService } from '../../services/share-manager';
import { PwaInstallService } from '../../../shared/services/pwa-install';
import { UserSettings } from '../dialogs/components/user-settings/user-settings';
import { InstallPwaDialog } from '../dialogs/components/install-pwa/install-pwa';
import { APP_VERSION } from '../../../version';

@Component({
  selector: 'wgl-game-menu',
  imports: [MatIconModule, MatMenuModule, MatButtonModule, MatDialogModule, MatDividerModule],
  templateUrl: './game-menu.html',
  styleUrl: './game-menu.scss',
})
export class GameMenu {
  public shareManager = inject(ShareManagerService);
  public pwaInstallService = inject(PwaInstallService);
  public appVersion = APP_VERSION;

  private notify = inject(NotifyService);
  private analyticsManager = inject(AnalyticsManagerService);
  private dialog = inject(MatDialog);

  public AboutClick(): void {
    this.analyticsManager.Log(AnalyticsEventType.GameMenuAboutCTA);
    this.notify.Notify();
  }

  public SettingsClick(): void {
    this.analyticsManager.Log(AnalyticsEventType.GameMenuSettingsCTA);
    this.dialog.open(UserSettings, {
      minWidth: '20em',
      panelClass: ['wgl-pane-bounce'],
    });
  }

  public async InstallAppClick(): Promise<void> {
    this.analyticsManager.Log(AnalyticsEventType.GameMenuInstallAppCTA, {
      canInstall: this.pwaInstallService.canInstall(),
      isStandalone: this.pwaInstallService.isStandalone(),
    });

    if (this.pwaInstallService.canInstall()) {
      const result = await this.pwaInstallService.promptInstall();
      if (result === 'accepted') {
        return;
      }
    }

    this.dialog.open(InstallPwaDialog, {
      minWidth: '20em',
      panelClass: ['wgl-pane-bounce'],
    });
  }
}

export { GameMenu as GameMenuComponent };
