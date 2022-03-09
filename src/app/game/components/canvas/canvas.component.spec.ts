import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { EffectsManagerService } from '../../services/effects-manager.service';
import { GameEngineService } from '../../services/game-engine.service';
import { InteractionManagerService } from '../../services/interaction-manager.service';
import { MaterialManagerService } from '../../services/material/material-manager.service';
import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { TextureManagerService } from '../../services/texture/texture-manager.service';

import { CanvasComponent } from './canvas.component';

describe('CanvasComponent', () => {
  let component: CanvasComponent;
  let fixture: ComponentFixture<CanvasComponent>;

  let sceneManagerService: SceneManagerService;

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

    sceneManagerService = TestBed.inject(SceneManagerService);
    spyOn<any>(sceneManagerService, 'animate');
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
