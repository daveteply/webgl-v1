import { TestBed } from '@angular/core/testing';

import { ShareManager } from './share-manager';

describe('ShareManager', () => {
  let service: ShareManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShareManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
