import { TestBed } from '@angular/core/testing';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';

import { EffectsManagerService } from './effects-manager.service';
import { GameEngineService } from './game-engine.service';
import { ScoringManagerService } from './scoring-manager.service';

describe('EffectsManagerService', () => {
  let service: EffectsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EffectsManagerService, AudioManagerService, ScoringManagerService, GameEngineService],
    });
    service = TestBed.inject(EffectsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
