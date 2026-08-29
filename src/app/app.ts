import { Component, HostListener, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

import { AppVisibilityService } from './shared/services/app-visibility';

@Component({
  selector: 'wgl-root',
  imports: [RouterOutlet, MatDialogModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private appVisibility = inject(AppVisibilityService);
  private document = inject(DOCUMENT);

  @HostListener('document:visibilitychange')
  visibilitychange() {
    this.appVisibility.VisibilityChanged.next(!this.document.hidden);
  }
}
