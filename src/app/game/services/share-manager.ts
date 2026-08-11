import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT, formatNumber } from '@angular/common';
import { forkJoin, Observable, Subject } from 'rxjs';
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

  public ShareInitiated: Subject<void> = new Subject<void>();
  public ShareFailed: Subject<void> = new Subject<void>();

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
        await this.document.fonts.load('bold 8em "Changa"');
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

          // upper gradient for logo
          const upperGradHeight = img.height * 0.22;
          const upperGrad = ctx.createLinearGradient(0, 0, 0, upperGradHeight);
          upperGrad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
          upperGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
          upperGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = upperGrad;
          ctx.fillRect(0, 0, img.width, upperGradHeight);

          // draw Rikkle logo at top center
          if (useLogo && this._rikkleLogo) {
            ctx.drawImage(this._rikkleLogo, img.width / 2 - this._rikkleLogo.width / 2, 60);
          }

          // lower gradient for level & score text
          const lowerGradHeight = img.height * 0.28;
          const lowerGrad = ctx.createLinearGradient(0, img.height - lowerGradHeight, 0, img.height);
          lowerGrad.addColorStop(0, 'transparent');
          lowerGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
          lowerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
          ctx.fillStyle = lowerGrad;
          ctx.fillRect(0, img.height - lowerGradHeight, img.width, lowerGradHeight);

          // overlay level & score text at bottom
          ctx.textAlign = 'center';
          ctx.font = 'bold 8em "Changa", sans-serif';
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 16;
          ctx.lineJoin = 'round';

          const bottomY = img.height - 100;
          const levelStr = `Level: ${this.scoringManager.Level}`;
          const scoreStr = `Score: ${formatNumber(this.scoringManager.Score, 'en-US')}`;

          ctx.strokeText(levelStr, img.width / 2, bottomY - 110);
          ctx.fillText(levelStr, img.width / 2, bottomY - 110);

          ctx.strokeText(scoreStr, img.width / 2, bottomY);
          ctx.fillText(scoreStr, img.width / 2, bottomY);

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

      this.ShareInitiated.next();

      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ ...shareData, files: [file] });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      } else {
        this.triggerDownload(screenShotDataUrl);
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
