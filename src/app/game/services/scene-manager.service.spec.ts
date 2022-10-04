import { TestBed } from '@angular/core/testing';

import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { EffectsManagerService } from './effects-manager.service';
import { GameEngineService } from './game-engine.service';
import { InteractionManagerService } from './interaction-manager.service';
import { MaterialManagerService } from './material/material-manager.service';
import { ObjectManagerService } from './object-manager.service';
import { SceneManagerService } from './scene-manager.service';
import { ScoringManagerService } from './scoring-manager.service';
import { ShareManagerService } from './share-manager.service';
import { TextureManagerService } from './texture/texture-manager.service';

describe('SceneManagerService', () => {
  let service: SceneManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SceneManagerService,
        ObjectManagerService,
        MaterialManagerService,
        InteractionManagerService,
        GameEngineService,
        ScoringManagerService,
        EffectsManagerService,
        TextureManagerService,
        AudioManagerService,
        ShareManagerService,
      ],
    });
    service = TestBed.inject(SceneManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
