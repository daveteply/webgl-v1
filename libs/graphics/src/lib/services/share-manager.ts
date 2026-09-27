import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { LevelCompleteShareData, SHARE_FILE_NAME, SHARE_URL } from '@rikkle/engine';
import { LanguageService } from '@rikkle/shared';
import { ScoringManagerService } from './scoring-manager';

@Injectable({
  providedIn: 'root',
})
export class ShareManagerService {
  private scoringManager = inject(ScoringManagerService);
  private languageService = inject(LanguageService);
  private document = inject(DOCUMENT);

  private _screenShotRequested = false;
  get ScreenShotRequested(): boolean {
    return this._screenShotRequested;
  }

  private _cachedLevelSnapshotDataUrl?: string;
  get CachedLevelSnapshotDataUrl(): string | undefined {
    return this._cachedLevelSnapshotDataUrl;
  }

  private _levelSnapshotRequested = false;
  get LevelSnapshotRequested(): boolean {
    return this._levelSnapshotRequested;
  }

  private _rikkleLogo!: HTMLImageElement;

  private _inLevel = signal<boolean>(false);
  get InLevel(): boolean {
    return this._inLevel();
  }

  public ShareInitiated: Subject<void> = new Subject<void>();
  public ShareFailed: Subject<void> = new Subject<void>();

  public UpdateInLevel(inLevel: boolean): void {
    this._inLevel.set(inLevel);
  }

  public CaptureLevelSnapshot(): void {
    this._levelSnapshotRequested = true;
  }

  public ClearLevelSnapshot(): void {
    this._cachedLevelSnapshotDataUrl = undefined;
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
    if (this._levelSnapshotRequested) {
      this._levelSnapshotRequested = false;
      this._cachedLevelSnapshotDataUrl = screenShotDataUrl;
      return;
    }

    this._screenShotRequested = false;

    if (screenShotDataUrl) {
      this.loadRikkleLogo().subscribe({
        next: () => {
          this.createScreenShot(screenShotDataUrl);
        },
        error: () => {
          this.createScreenShot(screenShotDataUrl, false);
        },
      });
    }
  }

  public ShareLevelComplete(data: LevelCompleteShareData, docReference?: Document): void {
    if (docReference) {
      this.document = docReference;
    }
    this.loadRikkleLogo().subscribe({
      next: () => {
        this.createLevelCompleteVictoryCard(data, true);
      },
      error: () => {
        this.createLevelCompleteVictoryCard(data, false);
      },
    });
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

          const bottomY = img.height - 70;
          const levelStr = this.languageService.translate('SHARE.CANVAS_LEVEL', { level: this.scoringManager.Level });
          const formattedScore = this.languageService.formatNumber(this.scoringManager.Score);
          const scoreStr = this.languageService.translate('SHARE.CANVAS_SCORE', { score: formattedScore });
          const urlStr = 'rikkle.app';

          ctx.strokeText(levelStr, img.width / 2, bottomY - 140);
          ctx.fillText(levelStr, img.width / 2, bottomY - 140);

          ctx.strokeText(scoreStr, img.width / 2, bottomY - 45);
          ctx.fillText(scoreStr, img.width / 2, bottomY - 45);

          ctx.font = 'bold 3.2em "Changa", sans-serif';
          ctx.lineWidth = 8;
          ctx.fillStyle = '#00e5ff';
          ctx.strokeText(urlStr, img.width / 2, bottomY + 35);
          ctx.fillText(urlStr, img.width / 2, bottomY + 35);

          this.startShare(canvas.toDataURL());
        }
      }
    };
    screenShotImage.src = screenShotDataUrl;
  }

  private async createLevelCompleteVictoryCard(data: LevelCompleteShareData, useLogo = true): Promise<void> {
    if (this.document.fonts && typeof this.document.fonts.load === 'function') {
      try {
        await this.document.fonts.load('bold 2em "Changa"');
      } catch {
        // Fallback gracefully if font load check fails
      }
    }

    const renderCardOnCanvas = (backdropImg?: HTMLImageElement) => {
      const width = backdropImg?.width || 1080;
      const height = backdropImg?.height || 1920;

      const canvas = this.document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (backdropImg) {
        ctx.drawImage(backdropImg, 0, 0);
        ctx.fillStyle = 'rgba(10, 8, 22, 0.65)';
        ctx.fillRect(0, 0, width, height);
      } else {
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
        bgGrad.addColorStop(0, '#2e1065');
        bgGrad.addColorStop(0.7, '#0f0f1a');
        bgGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      const s = Math.max(0.6, Math.min(width, height) / 800);

      const cardWidth = Math.min(width * 0.88, 640 * s);
      const cardHeight = Math.min(height * 0.82, 780 * s);
      const cardX = (width - cardWidth) / 2;
      const cardY = (height - cardHeight) / 2;
      const cornerRadius = 24 * s;

      ctx.save();
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
      } else {
        ctx.rect(cardX, cardY, cardWidth, cardHeight);
      }
      const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
      cardGrad.addColorStop(0, 'rgba(67, 24, 114, 0.88)');
      cardGrad.addColorStop(0.5, 'rgba(109, 40, 217, 0.75)');
      cardGrad.addColorStop(1, 'rgba(147, 51, 234, 0.6)');
      ctx.fillStyle = cardGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(216, 180, 254, 0.45)';
      ctx.lineWidth = 3 * s;
      ctx.stroke();
      ctx.restore();

      let curY = cardY + 45 * s;

      if (useLogo && this._rikkleLogo) {
        const logoAspect = this._rikkleLogo.width / this._rikkleLogo.height;
        const logoH = 70 * s;
        const logoW = logoH * logoAspect;
        ctx.drawImage(this._rikkleLogo, width / 2 - logoW / 2, curY, logoW, logoH);
        curY += logoH + 28 * s;
      } else {
        curY += 20 * s;
      }

      ctx.textAlign = 'center';
      ctx.font = `bold ${32 * s}px "Changa", sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 6 * s;
      ctx.lineJoin = 'round';
      const levelLabel = this.languageService.translate('SHARE.CANVAS_LEVEL', { level: data.level });
      const completedText = this.languageService.translate('HEADINGS.LEVEL_COMPLETED');
      const heading = `${levelLabel} - ${completedText}`;
      ctx.strokeText(heading, width / 2, curY);
      ctx.fillText(heading, width / 2, curY);
      curY += 40 * s;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(cardX + 35 * s, curY);
      ctx.lineTo(cardX + cardWidth - 35 * s, curY);
      ctx.stroke();
      curY += 35 * s;

      const statRows: { label: string; value: string; color?: string }[] = [];

      if (data.fastestMatchTime && data.fastestMatchTime > 0) {
        const timeSec = `${Math.round((data.fastestMatchTime / 1000) * 100) / 100}s`;
        statRows.push({
          label: this.languageService.translate('LEVEL_COMPLETE.FASTEST_MATCH'),
          value: timeSec,
        });
      }

      if (data.fastMatchBonusTotal && data.fastMatchBonusTotal > 0) {
        statRows.push({
          label: this.languageService.translate('LEVEL_COMPLETE.SPEED_BONUS'),
          value: `+${this.languageService.formatNumber(data.fastMatchBonusTotal)}`,
          color: '#4ade80',
        });
      }

      if (data.moveCount !== undefined && data.moveCount > 0) {
        statRows.push({
          label: this.languageService.translate('LEVEL_COMPLETE.MOVES_USED'),
          value: `${data.moveCount}`,
          color: '#fbbf24',
        });
      }

      if (data.moveCountEarned !== undefined && data.moveCountEarned > 0) {
        statRows.push({
          label: this.languageService.translate('LEVEL_COMPLETE.MOVES_EARNED'),
          value: `+${data.moveCountEarned}`,
          color: '#4ade80',
        });
      }

      if (data.pieceCount !== undefined && data.pieceCount > 0) {
        statRows.push({
          label: this.languageService.translate('LEVEL_COMPLETE.PIECES'),
          value: `${data.pieceCount}`,
        });
      }

      if (data.perfectMatchBonus && data.perfectMatchBonus > 0) {
        statRows.push({
          label: this.languageService.translate('LEVEL_COMPLETE.PERFECT_MATCH'),
          value: `+${this.languageService.formatNumber(data.perfectMatchBonus)}`,
          color: '#f472b6',
        });
      }

      statRows.push({
        label: this.languageService.translate('LEVEL_COMPLETE.SCORE'),
        value: this.languageService.formatNumber(data.score),
        color: '#ffffff',
      });

      const rowHeight = 36 * s;
      const labelX = cardX + 45 * s;
      const valueX = cardX + cardWidth - 45 * s;

      for (const row of statRows) {
        ctx.textAlign = 'left';
        ctx.font = `${21 * s}px "Changa", sans-serif`;
        ctx.fillStyle = 'rgba(243, 232, 255, 0.9)';
        ctx.fillText(row.label, labelX, curY);

        ctx.textAlign = 'right';
        ctx.font = `bold ${23 * s}px "Changa", sans-serif`;
        ctx.fillStyle = row.color || '#ffffff';
        ctx.fillText(row.value, valueX, curY);

        curY += rowHeight;
      }

      curY = cardY + cardHeight - 30 * s;
      ctx.textAlign = 'center';
      ctx.font = `bold ${20 * s}px "Changa", sans-serif`;
      ctx.fillStyle = '#00e5ff';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 4 * s;
      ctx.strokeText('rikkle.app', width / 2, curY);
      ctx.fillText('rikkle.app', width / 2, curY);

      const fastestSec = data.fastestMatchTime ? `${Math.round((data.fastestMatchTime / 1000) * 10) / 10}` : '0';
      const scoreFormatted = this.languageService.formatNumber(data.score);
      const shareText = this.languageService.translate('SHARE.SOCIAL_TEXT_LEVEL_COMPLETE', {
        level: data.level,
        fastest: fastestSec,
        score: scoreFormatted,
        url: SHARE_URL,
      });

      this.startShare(canvas.toDataURL(), shareText);
    };

    if (this._cachedLevelSnapshotDataUrl) {
      const backdropImg = new Image();
      backdropImg.onload = () => renderCardOnCanvas(backdropImg);
      backdropImg.onerror = () => renderCardOnCanvas();
      backdropImg.src = this._cachedLevelSnapshotDataUrl;
    } else {
      renderCardOnCanvas();
    }
  }

  private async startShare(screenShotDataUrl: string, customText?: string): Promise<void> {
    try {
      const res = await fetch(screenShotDataUrl);
      const blob = await res.blob();
      const fileName = SHARE_FILE_NAME || 'rikkle-screen-shot.png';
      const file = new File([blob], fileName, { type: 'image/png' });

      const scoreFormatted = this.languageService.formatNumber(this.scoringManager.Score);
      const shareText =
        customText ||
        (this.scoringManager.Score > 0
          ? this.languageService.translate('SHARE.SOCIAL_TEXT_SCORE', {
              score: scoreFormatted,
              level: this.scoringManager.Level,
              url: SHARE_URL,
            })
          : this.languageService.translate('SHARE.SOCIAL_TEXT_DEFAULT', { url: SHARE_URL }));

      const shareData: ShareData = {
        title: this.languageService.translate('SHARE.SOCIAL_TITLE'),
        text: shareText,
        url: SHARE_URL,
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
