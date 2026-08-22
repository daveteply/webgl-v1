import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HorizontalLevelNavigator } from './horizontal-level-navigator';
import { InteractionManagerService } from '../../services/interaction-manager';
import { EffectsManagerService } from '../../services/effects-manager';

describe('HorizontalLevelNavigator', () => {
  let component: HorizontalLevelNavigator;
  let fixture: ComponentFixture<HorizontalLevelNavigator>;
  let interactionManager: InteractionManagerService;
  let effectsManager: EffectsManagerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalLevelNavigator],
    }).compileComponents();

    fixture = TestBed.createComponent(HorizontalLevelNavigator);
    component = fixture.componentInstance;
    interactionManager = TestBed.inject(InteractionManagerService);
    effectsManager = TestBed.inject(EffectsManagerService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update panOffset and computed percentages when interactionManager emits PanChange', () => {
    interactionManager.PanChange.next(0.5);
    expect(component.panOffset()).toBe(0.5);
    // (0.5 + 1)/2 * 100 = 75%
    expect(component.thumbPositionPercent()).toBe(75);
    expect(component.ariaValueNow()).toBe(75);
  });

  it('should step pan left and right when stepPan is called', () => {
    interactionManager.SetPan(0);
    component.stepPan(0.25);
    expect(interactionManager.PanOffset).toBeCloseTo(0.25);

    component.stepPan(-0.5);
    expect(interactionManager.PanOffset).toBeCloseTo(-0.25);
  });

  it('should handle keyboard navigation keys', () => {
    interactionManager.SetPan(0);

    // ArrowRight
    const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.onKeyDown(eventRight);
    expect(interactionManager.PanOffset).toBeCloseTo(0.1);

    // ArrowLeft
    const eventLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    component.onKeyDown(eventLeft);
    expect(interactionManager.PanOffset).toBeCloseTo(0);

    // Home
    const eventHome = new KeyboardEvent('keydown', { key: 'Home' });
    component.onKeyDown(eventHome);
    expect(interactionManager.PanOffset).toBe(-1);

    // End
    const eventEnd = new KeyboardEvent('keydown', { key: 'End' });
    component.onKeyDown(eventEnd);
    expect(interactionManager.PanOffset).toBe(1);
  });

  it('should update lock state when LevelChangeAnimation emits', () => {
    effectsManager.LevelChangeAnimation.next(true);
    expect(component.isBoardLocked()).toBe(true);

    effectsManager.LevelChangeAnimation.next(false);
    expect(component.isBoardLocked()).toBe(false);
  });
});
