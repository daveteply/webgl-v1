import { DecimalPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AudioManagerService } from '../../../shared/services/audio/audio-manager';
import { EffectsManagerService } from '../../services/effects-manager';
import { GameEngineService } from '../../services/game-engine';
import { InteractionManagerService } from '../../services/interaction-manager';
import { MaterialManagerService } from '../../services/material/material-manager';
import { ObjectManagerService } from '../../services/object-manager';
import { SceneManagerService } from '../../services/scene-manager';
import { ScoringManagerService } from '../../services/scoring-manager';
import { ShareManagerService } from '../../services/share-manager';
import { TextureManagerService } from '../../services/texture/texture-manager';
import { TextZoom } from '../../text/components/text-zoom/text-zoom';
import { GameContainer } from './game-container';

describe('GameContainer', () => {
  let component: GameContainer;
  let fixture: ComponentFixture<GameContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, MatProgressBarModule, MatMenuModule, GameContainer, TextZoom],
      providers: [
        provideAnimations(),
        DecimalPipe,
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
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
