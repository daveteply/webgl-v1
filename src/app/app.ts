import { Component, HostListener, DestroyRef, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AppVisibilityService } from './shared/services/app-visibility';
import { NotifyService } from './shared/services/notify';
import { About } from './shared/components/about/about';

@Component({
  selector: 'wgl-root',
  imports: [RouterOutlet, MatDialogModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly ABOUT_DIALOG_ID = 'about-dialog';

  private dialog = inject(MatDialog);
  private notify = inject(NotifyService);
  private appVisibility = inject(AppVisibilityService);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  @HostListener('document:visibilitychange', ['$event'])
  visibilitychange(event?: Event) {
    this.appVisibility.VisibilityChanged.next(!this.document.hidden);
  }

  constructor() {
    this.notify.NotifyEvent.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const aboutDialog = this.dialog.getDialogById(this.ABOUT_DIALOG_ID);
      if (!aboutDialog) {
        this.dialog.open(About, { id: this.ABOUT_DIALOG_ID });
      } else {
        aboutDialog.close();
      }
    });
  }
}

export { App as AppComponent };
