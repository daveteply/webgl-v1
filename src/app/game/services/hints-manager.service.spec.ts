import { TestBed } from '@angular/core/testing';

import { HintsManagerService } from './hints-manager.service';

describe('HintsManagerService', () => {
  let service: HintsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HintsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
