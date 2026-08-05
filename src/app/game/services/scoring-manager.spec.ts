import { TestBed } from '@angular/core/testing';

import { ScoringManager } from './scoring-manager';

describe('ScoringManager', () => {
  let service: ScoringManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoringManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
