import { TestBed } from '@angular/core/testing';

import { ShareManagerService } from './share-manager';

describe('ShareManagerService', () => {
  let service: ShareManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShareManagerService);
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

  it('should report CanShare observable', () => {
    let result = false;
    service.CanShare().subscribe((canShare: boolean) => {
      result = canShare;
    });
    expect(typeof result).toBe('boolean');
  });

  it('should update InLevel signal', () => {
    expect(service.InLevel).toBe(false);
    service.UpdateInLevel(true);
    expect(service.InLevel).toBe(true);
  });
});
