import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { About } from './about';
import { GameStateStore } from '@rikkle/state';
import { AnalyticsEventType, AnalyticsManagerService } from '../../services/analytics-manager';

describe('About', () => {
  let component: About;
  let fixture: ComponentFixture<About>;
  let analyticsManager: AnalyticsManagerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [About],
    }).compileComponents();

    analyticsManager = TestBed.inject(AnalyticsManagerService);
    vi.spyOn(analyticsManager, 'Log');

    fixture = TestBed.createComponent(About);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create and log AboutDialogViewed', () => {
    expect(component).toBeTruthy();
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.AboutDialogViewed,
      expect.objectContaining({ colorCount: expect.any(Number) }),
    );
  });

  it('should initialize levelColorScheme from GameStateStore', () => {
    const store = TestBed.inject(GameStateStore);
    store.updateLevelColors(['#0078AB'], { name: 'Glassmorphic Purple', emoji: '💜' });
    component.ngOnInit();
    expect(component.levelColorScheme()?.name).toBe('Glassmorphic Purple');
    expect(component.levelColorScheme()?.emoji).toBe('💜');
    expect(analyticsManager.Log).toHaveBeenCalledWith(
      AnalyticsEventType.AboutDialogViewed,
      expect.objectContaining({ colorScheme: 'Glassmorphic Purple' }),
    );
  });
});
