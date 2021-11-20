import { TestBed } from '@angular/core/testing';
import { Scene } from 'three';
import { GamePiece } from '../models/game-piece';
import { GameWheel } from '../models/game-wheel';

import { GameEngineService } from './game-engine.service';
import { ObjectManagerService } from './object-manager.service';
import { MaterialManagerService } from './material-manager.service';

function createMockAxle(objectManager: ObjectManagerService): GameWheel[] {
  const scene = new Scene();
  objectManager.InitShapes(scene);

  objectManager.Axle.forEach((gameWheel: GameWheel) => {
    for (const gamePiece of gameWheel.children as GamePiece[]) {
      gamePiece['_matchKey'] = 0;
    }
  });

  return objectManager.Axle;
}

describe('GameEngineService', () => {
  let service: GameEngineService;
  let objectManagerService: ObjectManagerService;
  let mockAxle: GameWheel[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ObjectManagerService, MaterialManagerService],
    });
    service = TestBed.inject(GameEngineService);
    objectManagerService = new ObjectManagerService(
      new MaterialManagerService()
    );
    mockAxle = createMockAxle(objectManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Match Tests', () => {
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
      expect(
        (mockAxle[0].children[mockAxle[0].children.length - 1] as GamePiece)
          .IsMatch
      ).toBeTrue();
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
