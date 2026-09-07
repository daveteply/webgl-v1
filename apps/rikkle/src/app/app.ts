import { Component, HostListener, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { AppVisibilityService } from '@rikkle/shared';

@Component({
  selector: 'wgl-root',
  imports: [RouterOutlet],
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
