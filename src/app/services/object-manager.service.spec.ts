import { TestBed } from '@angular/core/testing';

import { ObjectManagerService } from './object-manager.service';

describe('ObjectManagerService', () => {
  let service: ObjectManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
