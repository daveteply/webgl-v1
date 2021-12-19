import { TestBed } from '@angular/core/testing';

import { MaterialManagerService } from './material-manager.service';

describe('MaterialManagerService', () => {
  let service: MaterialManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MaterialManagerService] });
    service = TestBed.inject(MaterialManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
