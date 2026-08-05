import { TestBed } from '@angular/core/testing';

import { MaterialManager } from './material-manager';

describe('MaterialManager', () => {
  let service: MaterialManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
