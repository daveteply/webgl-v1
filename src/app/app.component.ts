import { Component, NgZone, OnInit } from '@angular/core';

@Component({
  selector: 'wgl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {});
    });
  }

  ngOnInit(): void {}
}
