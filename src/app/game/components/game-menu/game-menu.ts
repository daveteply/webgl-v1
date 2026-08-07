import { Component, DestroyRef, DOCUMENT, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AnalyticsEventType, AnalyticsManagerService } from '../../../shared/services/analytics-manager';
import { NotifyService } from '../../../shared/services/notify';
import { ObjectManagerService } from '../../services/object-manager';
import { ShareManagerService } from '../../services/share-manager';
import { SaveGameConfirm } from '../dialogs/components/save-game-confirm/save-game-confirm';
import { UserSettings } from '../dialogs/components/user-settings/user-settings';

@Component({
  selector: 'wgl-game-menu',
  imports: [MatIconModule, MatMenuModule, MatButtonModule, MatDialogModule],
  templateUrl: './game-menu.html',
  styleUrl: './game-menu.scss',
})
export class GameMenu {
  public shareManager = inject(ShareManagerService);

  private notify = inject(NotifyService);
  private objectManager = inject(ObjectManagerService);
  private analyticsManager = inject(AnalyticsManagerService);
  private dialog = inject(MatDialog);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  public AboutClick(): void {
    this.analyticsManager.Log(AnalyticsEventType.GameMenuAboutCTA);
    this.notify.Notify();
  }

  public SettingsClick(): void {
    this.dialog.open(UserSettings, {
      minWidth: '20em',
      panelClass: ['wgl-pane-bounce'],
    });
  }

  public SaveState(): void {
    const dialogRef = this.dialog.open(SaveGameConfirm, {
      minWidth: '20em',
      disableClose: true,
      panelClass: ['wgl-pane-bounce'],
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.analyticsManager.Log(AnalyticsEventType.GameMenuSaveCTA);
        this.objectManager
          .SaveGameState()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            if (this.document.defaultView) {
              this.document.defaultView.location.href = '/';
            }
          });
      }
    });
  }
}

export { GameMenu as GameMenuComponent };
