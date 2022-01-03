import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsManagerService } from '../../services/effects-manager.service';
import { GameEngineService } from '../../services/game-engine.service';
import { InteractionManagerService } from '../../services/interaction-manager.service';
import { MaterialManagerService } from '../../services/material-manager.service';
import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { TextureManagerService } from '../../services/texture-manager.service';

import { GameContainerComponent } from './game-container.component';

describe('GameContainerComponent', () => {
  let component: GameContainerComponent;
  let fixture: ComponentFixture<GameContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, MatDialogModule],
      declarations: [GameContainerComponent],
      providers: [
        SceneManagerService,
        ObjectManagerService,
        MaterialManagerService,
        InteractionManagerService,
        GameEngineService,
        ScoringManagerService,
        EffectsManagerService,
        TextureManagerService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
