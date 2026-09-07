import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { BeforeInstallPromptEvent, PwaInstallService } from './pwa-install';
import { AnalyticsEventType, AnalyticsManagerService } from './analytics-manager';

describe('PwaInstallService', () => {
  let service: PwaInstallService;
  let analyticsManager: AnalyticsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    analyticsManager = TestBed.inject(AnalyticsManagerService);
    vi.spyOn(analyticsManager, 'Log');
    service = TestBed.inject(PwaInstallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return unavailable when no deferredPrompt is present', async () => {
    const outcome = await service.promptInstall();
    expect(outcome).toBe('unavailable');
    expect(analyticsManager.Log).not.toHaveBeenCalled();
  });

  it('should log PwaInstallPromptOutcome when prompt resolves', async () => {
    const mockPromptEvent: Partial<BeforeInstallPromptEvent> = {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' }),
    };

    service['deferredPrompt'] = mockPromptEvent as unknown as BeforeInstallPromptEvent;
    service.canInstall.set(true);

    const outcome = await service.promptInstall();
    expect(outcome).toBe('accepted');
    expect(analyticsManager.Log).toHaveBeenCalledWith(AnalyticsEventType.PwaInstallPromptOutcome, {
      outcome: 'accepted',
    });
  });
});
