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

  it('should emit ShareInitiated and ShareFailed events via Subject', () => {
    let initiated = false;
    let failed = false;

    service.ShareInitiated.subscribe(() => {
      initiated = true;
    });

    service.ShareFailed.subscribe(() => {
      failed = true;
    });

    service.ShareInitiated.next();
    service.ShareFailed.next();

    expect(initiated).toBe(true);
    expect(failed).toBe(true);
  });
});
