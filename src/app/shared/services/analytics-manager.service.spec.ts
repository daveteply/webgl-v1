import { TestBed } from '@angular/core/testing';

import { AnalyticsManagerService } from './analytics-manager.service';

describe('AnalyticsManagerService', () => {
  let service: AnalyticsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyticsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
