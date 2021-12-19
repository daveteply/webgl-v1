import { TestBed } from '@angular/core/testing';

import { ScoringManagerService } from './scoring-manager.service';

describe('ScoringManagerService', () => {
  let service: ScoringManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoringManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
