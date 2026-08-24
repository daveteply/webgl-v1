import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HintsManagerService, TutorialType } from '../../services/hints-manager';
import { InteractionManagerService } from '../../services/interaction-manager';
import { TutorialOverlay } from './tutorial-overlay';
import { vi } from 'vitest';
import { StorageService } from '../../../shared/services/storage/storage.service';

describe('TutorialOverlay', () => {
  let component: TutorialOverlay;
  let fixture: ComponentFixture<TutorialOverlay>;
  let hintsManager: HintsManagerService;
  let interactionManager: InteractionManagerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialOverlay, MatButtonModule, MatIconModule],
      providers: [
        HintsManagerService,
        StorageService,
        {
          provide: InteractionManagerService,
          useValue: {
            LockBoard: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    hintsManager = TestBed.inject(HintsManagerService);
    interactionManager = TestBed.inject(InteractionManagerService);
    hintsManager.ResetAllTutorials();

    fixture = TestBed.createComponent(TutorialOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and be inactive initially', () => {
    expect(component).toBeTruthy();
    expect(component.isActive()).toBe(false);
  });

  it('should activate overlay and lock board when a tutorial is shown', () => {
    hintsManager.ShowTutorial(TutorialType.RotateHorizontal);
    fixture.detectChanges();

    expect(component.isActive()).toBe(true);
    expect(interactionManager.LockBoard).toHaveBeenCalledWith(true);
    expect(component.spotlight()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.tutorial-card')).toBeTruthy();
  });

  it('should render horizontal swipe guide when arrows are horizontal', () => {
    hintsManager.ShowTutorial(TutorialType.RotateHorizontal);
    fixture.detectChanges();

    const guide = fixture.nativeElement.querySelector('.horizontal-guide');
    expect(guide).toBeTruthy();
  });

  it('should render vertical swipe guide when arrows are vertical', () => {
    hintsManager.ShowTutorial(TutorialType.RotateVertical);
    fixture.detectChanges();

    const guide = fixture.nativeElement.querySelector('.vertical-guide');
    expect(guide).toBeTruthy();
  });

  it('should render power move guide when tutorial type is PowerMove', () => {
    hintsManager.ShowTutorial(TutorialType.PowerMove);
    fixture.detectChanges();

    const guide = fixture.nativeElement.querySelector('.power-move-guide');
    expect(guide).toBeTruthy();
  });

  it('should dismiss tutorial when onGotIt is called', () => {
    hintsManager.ShowTutorial(TutorialType.MovesDecrease);
    fixture.detectChanges();

    component.onGotIt();
    fixture.detectChanges();

    expect(component.isActive()).toBe(false);
    expect(interactionManager.LockBoard).toHaveBeenCalledWith(false);
  });

  it('should skip all tutorials when onSkipAll is called', () => {
    hintsManager.ShowTutorial(TutorialType.RotateHorizontal);
    fixture.detectChanges();

    component.onSkipAll();
    fixture.detectChanges();

    expect(component.isActive()).toBe(false);
    expect(hintsManager.IsHintViewed(hintsManager.GetTutorialConfig(TutorialType.MovesDecrease).storageKey)).toBe(true);
  });
});
