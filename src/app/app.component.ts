import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AboutComponent } from './shared/components/about/about.component';
import { NotifyService } from './shared/services/notify.service';

@Component({
  selector: 'wgl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly ABOUT_DIALOG_ID = 'about-dialog';

  sideNavOpen: boolean = false;

  constructor(private dialog: MatDialog, private notify: NotifyService) {
    this.notify.NotifyEvent.subscribe(() => {
      const aboutDialog = this.dialog.getDialogById(this.ABOUT_DIALOG_ID);
      if (!aboutDialog) {
        this.dialog.open(AboutComponent, { id: this.ABOUT_DIALOG_ID });
      } else {
        aboutDialog.close();
      }
    });
  }
}
