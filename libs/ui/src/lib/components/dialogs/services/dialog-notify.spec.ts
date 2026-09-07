import { TestBed } from '@angular/core/testing';

import { DialogNotifyService } from './dialog-notify';

describe('DialogNotifyService', () => {
  let service: DialogNotifyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogNotifyService);
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
