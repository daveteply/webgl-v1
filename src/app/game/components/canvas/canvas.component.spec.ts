import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioManagerService } from '../../services/audio/audio-manager.service';
import { EffectsManagerService } from '../../services/effects-manager.service';
import { GameEngineService } from '../../services/game-engine.service';
import { InteractionManagerService } from '../../services/interaction-manager.service';
import { MaterialManagerService } from '../../services/material-manager.service';
import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { TextureManagerService } from '../../services/texture-manager.service';

import { CanvasComponent } from './canvas.component';

describe('CanvasComponent', () => {
  let component: CanvasComponent;
  let fixture: ComponentFixture<CanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CanvasComponent],
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
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
