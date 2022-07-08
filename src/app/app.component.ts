import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AboutComponent } from './shared/components/about/about.component';
import { AppVisibilityService } from './shared/services/app-visibility.service';
import { NotifyService } from './shared/services/notify.service';

@Component({
  selector: 'wgl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly ABOUT_DIALOG_ID = 'about-dialog';

  @HostListener('document:visibilitychange', ['$event'])
  visibilitychange() {
    this.appVisibility.VisibilityChanged.next(!this.document.hidden);
  }

  constructor(
    private dialog: MatDialog,
    private notify: NotifyService,
    private appVisibility: AppVisibilityService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.notify.NotifyEvent.subscribe(() => {
      const aboutDialog = this.dialog.getDialogById(this.ABOUT_DIALOG_ID);
      if (!aboutDialog) {
        this.dialog.open(AboutComponent, { id: this.ABOUT_DIALOG_ID, panelClass: 'cdk-overlay-pane__show' });
      } else {
        aboutDialog.close();
      }
    });
  }
}
