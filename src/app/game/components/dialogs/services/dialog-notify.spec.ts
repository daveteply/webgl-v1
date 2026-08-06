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
});
