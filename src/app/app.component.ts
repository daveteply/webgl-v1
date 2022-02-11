import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AboutComponent } from './shared/components/about/about.component';

@Component({
  selector: 'wgl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly ABOUT_DIALOG_ID = 'about-dialog';

  constructor(private dialog: MatDialog) {}

  about(): void {
    const aboutDialog = this.dialog.getDialogById(this.ABOUT_DIALOG_ID);
    if (!aboutDialog) {
      this.dialog.open(AboutComponent, { id: this.ABOUT_DIALOG_ID });
    } else {
      aboutDialog.close();
    }
  }
}
