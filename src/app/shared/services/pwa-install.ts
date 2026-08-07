import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PwaInstallService {
  private deferredPrompt: any = null;

  public canInstall = signal<boolean>(false);
  public isStandalone = signal<boolean>(false);

  constructor() {
    this.checkStandalone();
    this.initListeners();
  }

  private checkStandalone(): void {
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
        (navigator as any)?.standalone === true ||
        (document.referrer && document.referrer.includes('android-app://'));
      this.isStandalone.set(!!isStandaloneMode);
    }
  }

  private initListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.canInstall.set(true);
      });

      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.canInstall.set(false);
        this.isStandalone.set(true);
      });
    }
  }

  public isIOS(): boolean {
    if (typeof navigator === 'undefined') return false;
    const userAgent = navigator.userAgent || '';
    const isAppleDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isMacTouch = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return isAppleDevice || isMacTouch;
  }

  public async promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!this.deferredPrompt) {
      return 'unavailable';
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.canInstall.set(false);
      return choiceResult.outcome === 'accepted' ? 'accepted' : 'dismissed';
    } catch {
      this.deferredPrompt = null;
      this.canInstall.set(false);
      return 'unavailable';
    }
  }
}
