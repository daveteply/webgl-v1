import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import mixpanel from 'mixpanel-browser';

import { AnalyticsManagerService, AnalyticsEventType, MIXPANEL_TOKEN } from './analytics-manager';

vi.mock('mixpanel-browser', () => {
  const mockMixpanel = {
    init: vi.fn(),
    track: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    people: {
      set: vi.fn(),
    },
  };
  return {
    default: mockMixpanel,
    ...mockMixpanel,
  };
});

describe('AnalyticsManagerService', () => {
  let service: AnalyticsManagerService;

  beforeEach(async () => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyticsManagerService);
    await service.init();
  });

  it('should be created and initialize Mixpanel with project token and configuration', () => {
    expect(service).toBeTruthy();
    expect(mixpanel.init).toHaveBeenCalledWith(
      MIXPANEL_TOKEN,
      expect.objectContaining({
        autocapture: true,
        record_sessions_percent: 100,
      }),
    );
  });

  it('should track mapped event names for AnalyticsEventType', () => {
    service.Log(AnalyticsEventType.ShareCTA);
    expect(mixpanel.track).toHaveBeenCalledWith('ShareCTA', undefined);

    service.Log(AnalyticsEventType.GameMenuAboutCTA, { level: 2 });
    expect(mixpanel.track).toHaveBeenCalledWith('GameMenuAboutCTA', { level: 2 });

    service.Log(AnalyticsEventType.LevelDialogNextCTA);
    expect(mixpanel.track).toHaveBeenCalledWith('LevelDialogNextCTA', undefined);

    service.Log(AnalyticsEventType.IntroDialogRestoreCTA);
    expect(mixpanel.track).toHaveBeenCalledWith('IntroDialogRestoreCTA', undefined);
  });

  it('should queue actions until Mixpanel is loaded', async () => {
    vi.clearAllMocks();
    const uninitializedService = new AnalyticsManagerService();
    uninitializedService.Track('Queued_Event', { test: true });

    expect(mixpanel.track).not.toHaveBeenCalledWith('Queued_Event', { test: true });

    await uninitializedService.init();

    expect(mixpanel.track).toHaveBeenCalledWith('Queued_Event', { test: true });
  });

  it('should track custom named events with optional properties', () => {
    service.Track('Custom_Event', { prop1: 'value1' });
    expect(mixpanel.track).toHaveBeenCalledWith('Custom_Event', { prop1: 'value1' });
  });

  it('should delegate identify call to mixpanel', () => {
    service.Identify('user_12345');
    expect(mixpanel.identify).toHaveBeenCalledWith('user_12345');
  });

  it('should delegate SetUserProperties to mixpanel people.set', () => {
    service.SetUserProperties({ name: 'Player1', highLevel: 10 });
    expect(mixpanel.people.set).toHaveBeenCalledWith({ name: 'Player1', highLevel: 10 });
  });

  it('should delegate Reset to mixpanel reset', () => {
    service.Reset();
    expect(mixpanel.reset).toHaveBeenCalled();
  });
});
