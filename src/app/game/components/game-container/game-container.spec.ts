import { DecimalPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

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
import { AnalyticsEventType, AnalyticsManagerService } from '../../../shared/services/analytics-manager';
import { HintsManagerService, TutorialType } from '../../services/hints-manager';
import { GameContainer } from './game-container';

describe('GameContainer', () => {
  let component: GameContainer;
  let fixture: ComponentFixture<GameContainer>;
  let objectManager: ObjectManagerService;
  let analyticsManager: AnalyticsManagerService;

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

    objectManager = TestBed.inject(ObjectManagerService);
    analyticsManager = TestBed.inject(AnalyticsManagerService);
    vi.spyOn(analyticsManager, 'Log');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should configure dialog height correctly when provided', () => {
    const config = component['dialogConfig']('17.5em');
    expect(config.height).toBe('17.5em');
    expect(config.maxHeight).toBe('90dvh');
    expect(config.disableClose).toBe(true);
  });

  it('should log LevelCompleted when level is completed successfully', () => {
    objectManager.LevelCompleted.next(false);
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.LevelCompleted,
      expect.objectContaining({ level: expect.any(Number) }),
    );
  });

  it('should log GameOver when game over occurs', () => {
    objectManager.LevelCompleted.next(true);
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.GameOver,
      expect.objectContaining({ level: expect.any(Number) }),
    );
  });

  it('should trigger tutorial on moves changes', () => {
    const hintsManager = TestBed.inject(HintsManagerService);
    const scoringManager = TestBed.inject(ScoringManagerService);
    const showSpy = vi.spyOn(hintsManager, 'ShowTutorial');

    scoringManager.MovesChange.next(false);
    expect(showSpy).toHaveBeenCalledWith(TutorialType.MovesDecrease);

    scoringManager.MovesChange.next(true);
    expect(showSpy).toHaveBeenCalledWith(TutorialType.MovesIncrease);
  });

  it('should start idle timer for RotateHorizontal on Level 1', () => {
    const hintsManager = TestBed.inject(HintsManagerService);
    const startIdleSpy = vi.spyOn(hintsManager, 'StartIdleTimer');

    objectManager.LevelChangeAnimationComplete.next();
    expect(startIdleSpy).toHaveBeenCalledWith(TutorialType.RotateHorizontal);
  });

  it('should trigger GameMenu tutorial on Level 5', () => {
    const hintsManager = TestBed.inject(HintsManagerService);
    const scoringManager = TestBed.inject(ScoringManagerService);
    const showSpy = vi.spyOn(hintsManager, 'ShowTutorial');

    scoringManager.level.set(5);
    objectManager.LevelChangeAnimationComplete.next();
    expect(showSpy).toHaveBeenCalledWith(TutorialType.GameMenu);
  });
});
