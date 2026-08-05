import { TestBed } from '@angular/core/testing';

import { HintsManager } from './hints-manager';

describe('HintsManager', () => {
  let service: HintsManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HintsManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
