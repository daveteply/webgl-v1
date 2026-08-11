import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppVisibilityService {
  VisibilityChanged: Subject<boolean>;

  constructor() {
    this.VisibilityChanged = new Subject<boolean>();
  }
}

export { AppVisibilityService as AppVisibility };
