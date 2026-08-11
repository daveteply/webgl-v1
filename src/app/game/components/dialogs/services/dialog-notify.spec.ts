import { TestBed } from '@angular/core/testing';

import { DialogNotify } from './dialog-notify';

describe('DialogNotify', () => {
  let service: DialogNotify;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogNotify);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit via DialogNotifyEvent when Notify is called', () => {
    let emitted = false;
    service.DialogNotifyEvent.subscribe(() => {
      emitted = true;
    });
    service.Notify();
    expect(emitted).toBe(true);
  });
});
