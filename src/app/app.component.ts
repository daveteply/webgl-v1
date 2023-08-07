import { Component, HostListener, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppVisibilityService } from './shared/services/app-visibility.service';
import { NotifyService } from './shared/services/notify.service';
import { AboutDialogComponent } from './shared/components/about-dialog/about-dialog.component';

@Component({
  selector: 'wgl-root',
  standalone: true,
  imports: [RouterOutlet, MatDialogModule],
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
        this.dialog.open(AboutDialogComponent, { id: this.ABOUT_DIALOG_ID });
      } else {
        aboutDialog.close();
      }
    });
  }
}
