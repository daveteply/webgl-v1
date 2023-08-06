import { TestBed } from '@angular/core/testing';

import { AdmobManagerService } from './admob-manager.service';

describe('AdmobManagerService', () => {
  let service: AdmobManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdmobManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
