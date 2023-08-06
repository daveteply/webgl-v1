import { TestBed } from '@angular/core/testing';

import { DialogNotifyService } from './dialog-notify.service';

describe('DialogNotifyService', () => {
  let service: DialogNotifyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogNotifyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
