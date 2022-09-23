import { TestBed } from '@angular/core/testing';

import { ShareManagerService } from './share-manager.service';

describe('ShareManagerService', () => {
  let service: ShareManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShareManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
