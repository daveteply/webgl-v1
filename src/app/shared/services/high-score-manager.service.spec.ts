import { TestBed } from '@angular/core/testing';

import { HighScoreManagerService } from './high-score-manager.service';

describe('HighScoreManagerService', () => {
  let service: HighScoreManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HighScoreManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
