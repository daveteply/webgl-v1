import { TestBed } from '@angular/core/testing';

import { EffectsManager } from './effects-manager';

describe('EffectsManager', () => {
  let service: EffectsManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EffectsManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
