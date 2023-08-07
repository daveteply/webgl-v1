import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { EffectsManagerService } from '../../services/effects-manager.service';
import { GameEngineService } from '../../services/game-engine.service';
import { MaterialManagerService } from '../../services/material/material-manager.service';
import { ObjectManagerService } from '../../services/object-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { ShareManagerService } from '../../services/share-manager.service';
import { TextureManagerService } from '../../services/texture/texture-manager.service';

import { GameMenuComponent } from './game-menu.component';

describe('GameMenuComponent', () => {
  let component: GameMenuComponent;
  let fixture: ComponentFixture<GameMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatMenuModule, GameMenuComponent],
      providers: [
        ShareManagerService,
        ScoringManagerService,
        GameEngineService,
        ObjectManagerService,
        MaterialManagerService,
        TextureManagerService,
        EffectsManagerService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
