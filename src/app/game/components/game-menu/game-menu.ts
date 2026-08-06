import { Component, DestroyRef, DOCUMENT, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AnalyticsEventType, AnalyticsManagerService } from '../../../shared/services/analytics-manager';
import { NotifyService } from '../../../shared/services/notify';
import { ObjectManagerService } from '../../services/object-manager';
import { ShareManagerService } from '../../services/share-manager';

@Component({
  selector: 'wgl-game-menu',
  imports: [MatIconModule, MatMenuModule, MatButtonModule],
  templateUrl: './game-menu.html',
  styleUrl: './game-menu.scss',
})
export class GameMenu {
  public shareManager = inject(ShareManagerService);

  private notify = inject(NotifyService);
  private objectManager = inject(ObjectManagerService);
  private analyticsManager = inject(AnalyticsManagerService);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  public AboutClick(): void {
    this.analyticsManager.Log(AnalyticsEventType.GameMenuAboutCTA);
    this.notify.Notify();
  }

  public SaveState(): void {
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
}

export { GameMenu as GameMenuComponent };
