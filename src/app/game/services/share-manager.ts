import { EventEmitter, Injectable, inject, signal } from '@angular/core';
import { DOCUMENT, formatNumber } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';
import { SHARE_FILE_NAME } from '../game-constants';
import { ScoringManagerService } from './scoring-manager';

@Injectable({
  providedIn: 'root',
})
export class ShareManagerService {
  private scoringManager = inject(ScoringManagerService);
  private document = inject(DOCUMENT);

  private _screenShotRequested = false;
  get ScreenShotRequested(): boolean {
    return this._screenShotRequested;
  }

  private _rikkleLogo!: HTMLImageElement;
  private _turbogeekbearLogo!: HTMLImageElement;

  private _inLevel = signal<boolean>(false);
  get InLevel(): boolean {
    return this._inLevel();
  }

  public ShareInitiated: EventEmitter<void> = new EventEmitter();
  public ShareFailed: EventEmitter<void> = new EventEmitter();

  public UpdateInLevel(inLevel: boolean): void {
    this._inLevel.set(inLevel);
  }

  public CanShare(): Observable<boolean> {
    return new Observable((observer) => {
      const canShare = typeof window !== 'undefined' && ('share' in navigator || 'clipboard' in navigator);
      observer.next(canShare);
      observer.complete();
    });
  }

  public RequestScreenShot(docReference?: Document): void {
    if (docReference) {
      this.document = docReference;
    }
    this._screenShotRequested = true;
  }

  public UpdateScreenShotData(screenShotDataUrl: string): void {
    this._screenShotRequested = false;

    if (screenShotDataUrl) {
      forkJoin([this.loadRikkleLogo() /*, this.loadTurbogeekbearLogo()*/]).subscribe({
        next: () => {
          this.createScreenShot(screenShotDataUrl);
        },
        error: () => {
          this.createScreenShot(screenShotDataUrl, false);
        },
      });
    }
  }

  private loadRikkleLogo(): Observable<void> {
    return new Observable((observer) => {
      if (!this._rikkleLogo) {
        this._rikkleLogo = new Image();
        this._rikkleLogo.onload = (onloadEvent: Event) => {
          this._rikkleLogo = onloadEvent.target as HTMLImageElement;
          observer.next();
          observer.complete();
        };
        this._rikkleLogo.onerror = () => {
          observer.error();
          observer.complete();
        };
        this._rikkleLogo.src = 'assets/rikkle-logo-2026.webp';
      } else {
        observer.next();
        observer.complete();
      }
    });
  }

  // private loadTurbogeekbearLogo(): Observable<void> {
  //   return new Observable((observer) => {
  //     if (!this._turbogeekbearLogo) {
  //       this._turbogeekbearLogo = new Image();
  //       this._turbogeekbearLogo.onload = (onloadEvent: Event) => {
  //         this._turbogeekbearLogo = onloadEvent.target as HTMLImageElement;
  //         observer.next();
  //         observer.complete();
  //       };
  //       this._turbogeekbearLogo.onerror = () => {
  //         observer.error();
  //         observer.complete();
  //       };
  //       this._turbogeekbearLogo.src = 'assets/turbogeekbear-logo.webp';
  //     } else {
  //       observer.next();
  //       observer.complete();
  //     }
  //   });
  // }

  private async createScreenShot(screenShotDataUrl: string, useLogo = true): Promise<void> {
    if (this.document.fonts && typeof this.document.fonts.load === 'function') {
      try {
        await this.document.fonts.load('10em "Changa"');
      } catch {
        // Fallback gracefully if font load check fails
      }
    }

    const screenShotImage = new Image();
    screenShotImage.onload = (onLoadResult) => {
      const img = onLoadResult.target as HTMLImageElement;
      if (img) {
        const canvas = this.document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // draw captured WebGL frame
          ctx.drawImage(img, 0, 0);

          // upper gradient
          const height = img.height * 0.45;
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, 'black');
          grad.addColorStop(0.2, 'black');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, img.width, height);

          // draw Rikkle logo
          if (useLogo && this._rikkleLogo) {
            ctx.drawImage(this._rikkleLogo, img.width / 2 - this._rikkleLogo.width / 2, 100);
          }

          // overlay text using self-hosted Changa font
          ctx.textAlign = 'center';
          ctx.font = '10em "Changa", sans-serif';
          ctx.fillStyle = 'white';
          const textX = useLogo && this._rikkleLogo ? this._rikkleLogo.height + 200 : 300;
          ctx.fillText(`Level: ${this.scoringManager.Level}`, img.width / 2, textX);
          ctx.fillText(`Score: ${formatNumber(this.scoringManager.Score, 'en-US')}`, img.width / 2, textX + 100);

          // lower gradient
          // const lowerGrad = ctx.createLinearGradient(0, img.height - 300, 0, img.height);
          // lowerGrad.addColorStop(0, 'transparent');
          // lowerGrad.addColorStop(0.4, 'white');
          // lowerGrad.addColorStop(1, 'white');
          // ctx.fillStyle = lowerGrad;
          // ctx.fillRect(0, img.height - 300, img.width, img.height);

          // draw Turbogeekbear logo
          // if (useLogo && this._turbogeekbearLogo) {
          //   ctx.drawImage(
          //     this._turbogeekbearLogo,
          //     img.width / 2 - this._turbogeekbearLogo.width / 2,
          //     img.height - this._turbogeekbearLogo.height - 50,
          //   );
          // }

          this.startShare(canvas.toDataURL());
        }
      }
    };
    screenShotImage.src = screenShotDataUrl;
  }

  private async startShare(screenShotDataUrl: string): Promise<void> {
    try {
      const res = await fetch(screenShotDataUrl);
      const blob = await res.blob();
      const fileName = SHARE_FILE_NAME || 'rikkle-screen-shot.png';
      const file = new File([blob], fileName, { type: 'image/png' });

      const shareData: ShareData = {
        title: 'Rikkle, a game by Turbogeekbear',
        text: 'Have you seen Rikkle?!',
      };

      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        this.ShareInitiated.next();
        await navigator.share({ ...shareData, files: [file] });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        this.ShareInitiated.next();
      } else {
        this.triggerDownload(screenShotDataUrl);
        this.ShareInitiated.next();
      }
    } catch (err) {
      console.warn('Share error or cancellation:', err);
      this.ShareFailed.next();
    }
  }

  private triggerDownload(dataUrl: string): void {
    const a = this.document.createElement('a');
    a.download = SHARE_FILE_NAME || 'rikkle-screen-shot.png';
    a.href = dataUrl;
    this.document.body.appendChild(a);
    a.click();
    this.document.body.removeChild(a);
  }
}

export { ShareManagerService as ShareManager };
