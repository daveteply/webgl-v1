import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameEngineService } from '../../services/game-engine.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { ShareManagerService } from '../../services/share-manager.service';

import { ShareContentComponent } from './share-content.component';

describe('ShareContentComponent', () => {
  let component: ShareContentComponent;
  let fixture: ComponentFixture<ShareContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareContentComponent],
      providers: [ShareManagerService, ScoringManagerService, GameEngineService],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
