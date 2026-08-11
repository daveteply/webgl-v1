import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  private _notifyEvent: Subject<void>;

  get NotifyEvent(): Observable<void> {
    return this._notifyEvent.asObservable();
  }

  constructor() {
    this._notifyEvent = new Subject<void>();
  }

  public Notify(): void {
    this._notifyEvent.next();
  }
}

export { NotifyService as Notify };
