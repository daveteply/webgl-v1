import { TestBed } from '@angular/core/testing';
import { AudioManagerService } from './audio-manager.service';

import { EffectsManagerService } from './effects-manager.service';

describe('EffectsManagerService', () => {
  let service: EffectsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EffectsManagerService, AudioManagerService],
    });
    service = TestBed.inject(EffectsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
