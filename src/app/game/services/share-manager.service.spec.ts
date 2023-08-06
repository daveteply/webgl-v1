import { TestBed } from '@angular/core/testing';
import { GameEngineService } from './game-engine.service';
import { ScoringManagerService } from './scoring-manager.service';
import { ShareManagerService } from './share-manager.service';

describe('ShareManagerService', () => {
  let service: ShareManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ShareManagerService, ScoringManagerService, GameEngineService] });
    service = TestBed.inject(ShareManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
