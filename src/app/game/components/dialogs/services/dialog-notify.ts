import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DialogNotifyService {
  private _dialogEvent: Subject<void>;

  get DialogNotifyEvent(): Observable<void> {
    return this._dialogEvent.asObservable();
  }

  constructor() {
    this._dialogEvent = new Subject<void>();
  }

  public Notify(): void {
    this._dialogEvent.next();
  }
}

export { DialogNotifyService as DialogNotify };
