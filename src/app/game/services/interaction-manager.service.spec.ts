import { TestBed } from '@angular/core/testing';
import { AudioManagerService } from './audio/audio-manager.service';
import { EffectsManagerService } from './effects-manager.service';
import { GameEngineService } from './game-engine.service';

import { InteractionManagerService } from './interaction-manager.service';
import { MaterialManagerService } from './material-manager.service';
import { ObjectManagerService } from './object-manager.service';
import { ScoringManagerService } from './scoring-manager.service';
import { TextureManagerService } from './texture/texture-manager.service';

describe('InteractionManagerService', () => {
  let service: InteractionManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InteractionManagerService,
        ObjectManagerService,
        MaterialManagerService,
        GameEngineService,
        ScoringManagerService,
        EffectsManagerService,
        TextureManagerService,
        AudioManagerService,
      ],
    });
    service = TestBed.inject(InteractionManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
