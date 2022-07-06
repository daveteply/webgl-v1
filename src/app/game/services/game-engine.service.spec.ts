import { TestBed } from '@angular/core/testing';
import { Scene } from 'three';
import { GamePiece } from '../models/game-piece/game-piece';
import { GameWheel } from '../models/game-wheel';

import { GameEngineService } from './game-engine.service';
import { ObjectManagerService } from './object-manager.service';
import { MaterialManagerService } from './material/material-manager.service';
import { EffectsManagerService } from './effects-manager.service';
import { TextureManagerService } from './texture/texture-manager.service';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { ScoringManagerService } from './scoring-manager.service';
import { TextManagerService } from './text/text-manager.service';
import { SceneManagerService } from './scene-manager.service';
import { InteractionManagerService } from './interaction-manager.service';
import { Observable } from 'rxjs';

function createMockAxle(objectManager: ObjectManagerService) {
  return new Observable((o) => {
    objectManager.SetScene(new Scene());
    objectManager.InitShapes().subscribe(() => {
      objectManager.Axle.forEach((gameWheel: GameWheel) => {
        for (const gamePiece of gameWheel.children as GamePiece[]) {
          gamePiece['_matchKey'] = 0;
        }
      });
      o.next();
      o.complete();
    });
  });
}

describe('GameEngineService', () => {
  let service: GameEngineService;

  let mockMaterialService: MaterialManagerService;
  let effectManagerService: EffectsManagerService;
  let objectManagerService: ObjectManagerService;
  let audioManagerService: AudioManagerService;
  let textManagerService: TextManagerService;
  let sceneManagerService: SceneManagerService;

  let mockAxle: GameWheel[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ObjectManagerService,
        MaterialManagerService,
        GameEngineService,
        EffectsManagerService,
        TextureManagerService,
        AudioManagerService,
        ScoringManagerService,
        SceneManagerService,
        InteractionManagerService,
      ],
    });

    service = TestBed.inject(GameEngineService);

    sceneManagerService = TestBed.inject(SceneManagerService);
    spyOn<any>(sceneManagerService, 'animate');

    mockMaterialService = TestBed.inject(MaterialManagerService);
    effectManagerService = TestBed.inject(EffectsManagerService);
    audioManagerService = TestBed.inject(AudioManagerService);
    spyOn(audioManagerService, 'PlayAudio');
    textManagerService = TestBed.inject(TextManagerService);

    objectManagerService = new ObjectManagerService(
      mockMaterialService,
      effectManagerService,
      textManagerService,
      audioManagerService,
      service
    );
    createMockAxle(objectManagerService).subscribe(() => {
      mockAxle = objectManagerService.Axle;
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Match Tests', () => {
    it('should match none', () => {
      // mark all game pieces with a different game key
      let mockGameKey = 0;
      mockAxle.forEach((gameWheel) => {
        for (const gamePiece of gameWheel.children as GamePiece[]) {
          gamePiece['_matchKey'] = mockGameKey++;
        }
      });

      const initialGamePiece = mockAxle[0].children[0] as GamePiece;

      // find matches
      service.FindMatches(initialGamePiece, mockAxle);

      // perform tests
      mockAxle.forEach((gameWheel) => {
        for (const gamePiece of gameWheel.children as GamePiece[]) {
          // initial game piece will be marked as match
          if (gamePiece.id !== initialGamePiece.id) {
            expect(gamePiece.IsMatch).toBeFalse();
          }
        }
      });
    });

    it('should match app', () => {
      // note: all mocked game keys are set to 0
      service.FindMatches(mockAxle[0].children[0] as GamePiece, mockAxle);
      mockAxle.forEach((gameWheel) => {
        for (const gamePiece of gameWheel.children as GamePiece[]) {
          expect(gamePiece.IsMatch).toBeTrue();
        }
      });
    });

    it('should match 2 adjacent', () => {
      (mockAxle[0].children[0] as GamePiece)['_matchKey'] = 1;
      (mockAxle[0].children[1] as GamePiece)['_matchKey'] = 1;

      service.FindMatches(mockAxle[0].children[0] as GamePiece, mockAxle);

      expect((mockAxle[0].children[0] as GamePiece).IsMatch).toBeTrue();
      expect((mockAxle[0].children[1] as GamePiece).IsMatch).toBeTrue();
      expect((mockAxle[0].children[2] as GamePiece).IsMatch).toBeFalse();
    });

    it('should match entire row', () => {
      for (const gamePiece of mockAxle[0].children as GamePiece[]) {
        gamePiece['_matchKey'] = 1;
      }

      service.FindMatches(mockAxle[0].children[0] as GamePiece, mockAxle);

      expect((mockAxle[0].children[0] as GamePiece).IsMatch).toBeTrue();
      expect((mockAxle[0].children[1] as GamePiece).IsMatch).toBeTrue();
      expect((mockAxle[0].children[mockAxle[0].children.length - 1] as GamePiece).IsMatch).toBeTrue();
    });

    it('should match 2 vertical', () => {
      (mockAxle[0].children[0] as GamePiece)['_matchKey'] = 1;
      (mockAxle[1].children[0] as GamePiece)['_matchKey'] = 1;

      service.FindMatches(mockAxle[0].children[0] as GamePiece, mockAxle);

      expect((mockAxle[0].children[0] as GamePiece).IsMatch).toBeTrue();
      expect((mockAxle[1].children[0] as GamePiece).IsMatch).toBeTrue();
      expect((mockAxle[2].children[0] as GamePiece).IsMatch).toBeFalse();
    });
  });
});
