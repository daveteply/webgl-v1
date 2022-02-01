import { TestBed } from '@angular/core/testing';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { EffectsManagerService } from './effects-manager.service';
import { MaterialManagerService } from './material-manager.service';

import { ObjectManagerService } from './object-manager.service';
import { ScoringManagerService } from './scoring-manager.service';
import { TextureManagerService } from './texture/texture-manager.service';

describe('ObjectManagerService', () => {
  let service: ObjectManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ObjectManagerService,
        MaterialManagerService,
        EffectsManagerService,
        TextureManagerService,
        AudioManagerService,
        ScoringManagerService,
      ],
    });
    service = TestBed.inject(ObjectManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
