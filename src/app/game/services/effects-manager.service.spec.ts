import { TestBed } from '@angular/core/testing';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';

import { EffectsManagerService } from './effects-manager.service';
import { ScoringManagerService } from './scoring-manager.service';

describe('EffectsManagerService', () => {
  let service: EffectsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EffectsManagerService,
        AudioManagerService,
        ScoringManagerService,
      ],
    });
    service = TestBed.inject(EffectsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
