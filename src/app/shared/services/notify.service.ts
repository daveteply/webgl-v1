import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  private _notifyEvent: EventEmitter<void>;

  get NotifyEvent(): EventEmitter<void> {
    return this._notifyEvent;
  }

  constructor() {
    this._notifyEvent = new EventEmitter<void>();
  }

  public Notify(): void {
    this._notifyEvent.next();
  }
}
