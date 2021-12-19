import { TestBed } from '@angular/core/testing';
import { MaterialManagerService } from './material-manager.service';

import { ObjectManagerService } from './object-manager.service';

describe('ObjectManagerService', () => {
  let service: ObjectManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ObjectManagerService, MaterialManagerService],
    });
    service = TestBed.inject(ObjectManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
