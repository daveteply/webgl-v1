import { DecimalPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { EffectsManagerService } from '../../services/effects-manager.service';
import { GameEngineService } from '../../services/game-engine.service';
import { InteractionManagerService } from '../../services/interaction-manager.service';
import { MaterialManagerService } from '../../services/material/material-manager.service';
import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { TextureManagerService } from '../../services/texture/texture-manager.service';
import { TextZoomComponent } from '../text-zoom/text-zoom.component';
import { GameContainerComponent } from './game-container.component';

describe('GameContainerComponent', () => {
  let component: GameContainerComponent;
  let fixture: ComponentFixture<GameContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatDialogModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatMenuModule,
      ],
      declarations: [GameContainerComponent, TextZoomComponent],
      providers: [
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
