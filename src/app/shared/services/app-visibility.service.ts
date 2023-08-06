import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppVisibilityService {
  VisibilityChanged: EventEmitter<boolean>;

  constructor() {
    this.VisibilityChanged = new EventEmitter<boolean>();
  }
}
