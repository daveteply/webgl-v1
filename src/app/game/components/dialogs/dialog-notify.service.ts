import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DialogNotifyService {
  private _dialogEvent: EventEmitter<void>;

  get DialogNotifyEvent(): EventEmitter<void> {
    return this._dialogEvent;
  }

  constructor() {
    this._dialogEvent = new EventEmitter<void>();
  }

  public Notify(): void {
    this._dialogEvent.next();
  }
}
