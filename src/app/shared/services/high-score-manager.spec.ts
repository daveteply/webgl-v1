import { TestBed } from '@angular/core/testing';

import { HighScoreManager } from './high-score-manager';

describe('HighScoreManager', () => {
  let service: HighScoreManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HighScoreManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
