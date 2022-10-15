import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsManagerService } from 'src/app/shared/services/analytics-manager.service';
import { NotifyService } from 'src/app/shared/services/notify.service';
import { ObjectManagerService } from '../../services/object-manager.service';
import { ShareManagerService } from '../../services/share-manager.service';

@Component({
  selector: 'wgl-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.scss'],
})
export class GameMenuComponent implements OnDestroy {
  private notifier = new Subject();

  constructor(
    public shareManager: ShareManagerService,
    private notify: NotifyService,
    private objectManager: ObjectManagerService,
    private analyticsManager: AnalyticsManagerService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnDestroy(): void {
    this.notifier.next(undefined);
    this.notifier.complete();
  }

  public AboutClick(): void {
    this.analyticsManager.LogGameMenuAboutCTA();
    this.notify.Notify();
  }

  public SaveState(): void {
    this.analyticsManager.LogGameMenuSaveCTA();
    this.objectManager
      .SaveGameState()
      .pipe(takeUntil(this.notifier))
      .subscribe(() => {
        if (this.document.defaultView) {
          this.document.defaultView.location.href = '/';
        }
      });
  }
}
