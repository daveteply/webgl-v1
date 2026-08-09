import { Injectable, signal } from '@angular/core';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class PwaInstallService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  public canInstall = signal<boolean>(false);
  public isStandalone = signal<boolean>(false);

  constructor() {
    this.checkStandalone();
    this.initListeners();
  }

  private checkStandalone(): void {
    if (typeof window === 'undefined') return;

    const isStandaloneDisplay =
      (typeof window.matchMedia === 'function' &&
        (window.matchMedia('(display-mode: standalone)').matches ||
          window.matchMedia('(display-mode: fullscreen)').matches ||
          window.matchMedia('(display-mode: minimal-ui)').matches ||
          window.matchMedia('(display-mode: window-controls-overlay)').matches)) ||
      (navigator as any)?.standalone === true ||
      (document.referrer && document.referrer.includes('android-app://'));

    this.isStandalone.set(!!isStandaloneDisplay);

    if (typeof window.matchMedia === 'function') {
      try {
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const updateMode = (e: MediaQueryListEvent) => {
          if (e.matches) {
            this.isStandalone.set(true);
            this.canInstall.set(false);
          }
        };
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', updateMode);
        } else if ((mediaQuery as any).addListener) {
          (mediaQuery as any).addListener(updateMode);
        }
      } catch (err) {
        // Fallback for older engines
      }
    }
  }

  private initListeners(): void {
    if (typeof window === 'undefined') return;

    const globalPrompt = (window as any).deferredInstallPrompt || (window as any).__pwaInstallPrompt;
    if (globalPrompt) {
      this.deferredPrompt = globalPrompt;
      this.canInstall.set(true);
    }

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      (window as any).deferredInstallPrompt = e;
      this.canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      (window as any).deferredInstallPrompt = null;
      this.canInstall.set(false);
      this.isStandalone.set(true);
    });
  }

  public isIOS(): boolean {
    if (typeof navigator === 'undefined') return false;
    const userAgent = navigator.userAgent || '';
    const isAppleDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isMacTouch = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return isAppleDevice || isMacTouch;
  }

  public isAndroid(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /Android/i.test(navigator.userAgent || '');
  }

  public isInstallSupported(): boolean {
    return this.canInstall() || this.isIOS() || (!this.isStandalone() && typeof window !== 'undefined');
  }

  /**
   * Prompts the native OS/Browser installation dialog with retry handling and fallback protection.
   */
  public async promptInstall(maxRetries = 2): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!this.deferredPrompt) {
      return 'unavailable';
    }

    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        await this.deferredPrompt?.prompt();
        const choiceResult = await this.deferredPrompt?.userChoice;

        this.deferredPrompt = null;
        if (typeof window !== 'undefined') {
          (window as any).deferredInstallPrompt = null;
        }
        this.canInstall.set(false);

        return choiceResult?.outcome === 'accepted' ? 'accepted' : 'dismissed';
      } catch (error) {
        attempt++;
        if (attempt > maxRetries) {
          console.warn('PWA install prompt failed after retries:', error);
          this.deferredPrompt = null;
          if (typeof window !== 'undefined') {
            (window as any).deferredInstallPrompt = null;
          }
          this.canInstall.set(false);
          return 'unavailable';
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    return 'unavailable';
  }
}
