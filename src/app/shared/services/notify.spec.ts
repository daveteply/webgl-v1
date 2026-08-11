import { TestBed } from '@angular/core/testing';

import { Notify } from './notify';

describe('Notify', () => {
  let service: Notify;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Notify);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit via NotifyEvent when Notify is called', () => {
    let emitted = false;
    service.NotifyEvent.subscribe(() => {
      emitted = true;
    });
    service.Notify();
    expect(emitted).toBe(true);
  });
});
