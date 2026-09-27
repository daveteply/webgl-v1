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

          // render branded header (upper gradient & bold Rikkle logo)
          this.renderBrandedHeader(ctx, img.width, img.height, useLogo);

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

  private renderBrandedHeader(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    useLogo = true,
  ): { logoBottomY: number } {
    const upperGradHeight = Math.max(height * 0.22, 200);
    const upperGrad = ctx.createLinearGradient(0, 0, 0, upperGradHeight);
    upperGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    upperGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
    upperGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = upperGrad;
    ctx.fillRect(0, 0, width, upperGradHeight);

    let logoBottomY = 60;
    if (useLogo && this._rikkleLogo && this._rikkleLogo.width > 0) {
      const maxW = width * 0.88;
      const maxH = height * 0.3;
      const scale = Math.min(1, maxW / this._rikkleLogo.width, maxH / this._rikkleLogo.height);
      const logoW = this._rikkleLogo.width * scale;
      const logoH = this._rikkleLogo.height * scale;
      const logoX = (width - logoW) / 2;
      const logoY = Math.min(60, height * 0.05);

      ctx.drawImage(this._rikkleLogo, logoX, logoY, logoW, logoH);
      logoBottomY = logoY + logoH;
    }

    return { logoBottomY };
  }

  private renderBrandedFooter(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const footerGradHeight = Math.max(height * 0.12, 100);
    const footerGrad = ctx.createLinearGradient(0, height - footerGradHeight, 0, height);
    footerGrad.addColorStop(0, 'transparent');
    footerGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
    footerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = footerGrad;
    ctx.fillRect(0, height - footerGradHeight, width, footerGradHeight);

    const s = Math.max(0.8, Math.min(width, height) / 1000);
    const fontSize = Math.round(28 * s);
    const footerY = height - Math.round(25 * s);

    ctx.textAlign = 'center';
    ctx.font = `bold ${fontSize}px "Changa", sans-serif`;
    ctx.lineWidth = Math.round(6 * s);
    ctx.strokeStyle = 'black';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#00e5ff';
    ctx.strokeText('rikkle.app', width / 2, footerY);
    ctx.fillText('rikkle.app', width / 2, footerY);
  }

  private async createLevelCompleteVictoryCard(data: LevelCompleteShareData, useLogo = true): Promise<void> {
    if (this.document.fonts && typeof this.document.fonts.load === 'function') {
      try {
        await Promise.all([
          this.document.fonts.load('bold 48px "Changa"'),
          this.document.fonts.load('bold 32px "Changa"'),
          this.document.fonts.load('bold 8em "Changa"'),
        ]);
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

      // 1. Draw backdrop
      if (backdropImg) {
        ctx.drawImage(backdropImg, 0, 0);
        ctx.fillStyle = 'rgba(10, 8, 22, 0.45)';
        ctx.fillRect(0, 0, width, height);
      } else {
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
        bgGrad.addColorStop(0, '#2e1065');
        bgGrad.addColorStop(0.7, '#0f0f1a');
        bgGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Render big bold branded logo header (reused from createScreenShot)
      const { logoBottomY } = this.renderBrandedHeader(ctx, width, height, useLogo);

      // 3. Render branded footer
      this.renderBrandedFooter(ctx, width, height);

      // 4. Calculate stats data
      const statRows: { label: string; value: string; color?: string; isScore?: boolean }[] = [];

      if (data.fastMatchBonusTotal && data.fastMatchBonusTotal > 0) {
        statRows.push({
          label: this.languageService.translate('LEVEL_COMPLETE.SPEED_BONUS'),
          value: `+${this.languageService.formatNumber(data.fastMatchBonusTotal)}`,
          color: '#4ade80',
        });
      }

      if (data.fastestMatchTime && data.fastestMatchTime > 0) {
        const timeSec = `${Math.round((data.fastestMatchTime / 1000) * 100) / 100}s`;
        statRows.push({
          label: this.languageService.translate('LEVEL_COMPLETE.FASTEST_MATCH'),
          value: timeSec,
          color: '#67e8f9',
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
          color: '#f3e8ff',
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
        isScore: true,
      });

      // 5. Calculate card position and sizing
      const topY = logoBottomY + Math.max(16, height * 0.02);
      const bottomY = height - Math.max(70, height * 0.1);
      const availableH = bottomY - topY;

      const isLandscape = width > height;
      const cardWidth = Math.min(width * 0.78, isLandscape ? 760 : 700);
      const cardX = (width - cardWidth) / 2;

      const titleFontSize = Math.round(Math.min(48, Math.max(26, cardWidth * 0.058)));
      const paddingTop = Math.min(28, availableH * 0.04);
      const paddingBottom = Math.min(24, availableH * 0.03);
      const titleH = titleFontSize + 16;
      const dividerH = 20;

      const availForRows = availableH - paddingTop - titleH - dividerH - paddingBottom;
      const idealRowH = Math.round(cardWidth * 0.084);
      const rowHeight = Math.max(34, Math.min(idealRowH, Math.floor(availForRows / statRows.length)));
      const labelFontSize = Math.round(rowHeight * 0.5);
      const valueFontSize = Math.round(rowHeight * 0.58);
      const scoreFontSize = Math.round(rowHeight * 0.65);

      const totalRowsH = statRows.length * rowHeight;
      const cardHeight = paddingTop + titleH + dividerH + totalRowsH + paddingBottom;
      const cardY = topY + Math.max(0, (availableH - cardHeight) / 2);

      // 6. Draw glassmorphic victory card background
      ctx.save();
      ctx.beginPath();
      const cornerRadius = Math.min(24, cardWidth * 0.035);
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
      } else {
        ctx.rect(cardX, cardY, cardWidth, cardHeight);
      }
      const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
      cardGrad.addColorStop(0, 'rgba(45, 14, 80, 0.88)');
      cardGrad.addColorStop(0.5, 'rgba(76, 29, 149, 0.78)');
      cardGrad.addColorStop(1, 'rgba(109, 40, 217, 0.7)');
      ctx.fillStyle = cardGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(216, 180, 254, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // 7. Render header: LEVEL X - COMPLETED
      const levelLabel = this.languageService.translate('SHARE.CANVAS_LEVEL', { level: data.level });
      const completedText = this.languageService.translate('HEADINGS.LEVEL_COMPLETED');
      const heading = `${levelLabel} - ${completedText}`;

      let renderedTitleFontSize = titleFontSize;
      ctx.font = `bold ${renderedTitleFontSize}px "Changa", sans-serif`;
      while (ctx.measureText(heading).width > cardWidth - 48 && renderedTitleFontSize > 20) {
        renderedTitleFontSize -= 2;
        ctx.font = `bold ${renderedTitleFontSize}px "Changa", sans-serif`;
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.lineWidth = Math.max(4, Math.round(renderedTitleFontSize * 0.12));
      ctx.lineJoin = 'round';
      const titleY = cardY + paddingTop + renderedTitleFontSize * 0.85;
      ctx.strokeText(heading, width / 2, titleY);
      ctx.fillText(heading, width / 2, titleY);

      // Divider line
      const divY = titleY + 16;
      const divGrad = ctx.createLinearGradient(cardX + 24, 0, cardX + cardWidth - 24, 0);
      divGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      divGrad.addColorStop(0.5, 'rgba(216, 180, 254, 0.6)');
      divGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      ctx.strokeStyle = divGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + 24, divY);
      ctx.lineTo(cardX + cardWidth - 24, divY);
      ctx.stroke();

      // 8. Render stats rows
      const labelX = cardX + Math.max(28, cardWidth * 0.045);
      const valueX = cardX + cardWidth - Math.max(28, cardWidth * 0.045);
      let curY = divY + 14 + rowHeight * 0.7;

      for (const row of statRows) {
        if (row.isScore) {
          const pillY = curY - rowHeight * 0.66;
          const pillH = rowHeight * 0.94;
          const pillGrad = ctx.createLinearGradient(cardX + 16, 0, cardX + cardWidth - 16, 0);
          pillGrad.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
          pillGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.35)');
          pillGrad.addColorStop(1, 'rgba(168, 85, 247, 0.25)');
          ctx.fillStyle = pillGrad;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(cardX + 16, pillY, cardWidth - 32, pillH, 10);
          } else {
            ctx.rect(cardX + 16, pillY, cardWidth - 32, pillH);
          }
          ctx.fill();
          ctx.strokeStyle = 'rgba(244, 114, 182, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        const currLabelSize = row.isScore ? Math.round(scoreFontSize * 0.88) : labelFontSize;
        const currValueSize = row.isScore ? scoreFontSize : valueFontSize;
        const textStrokeWidth = Math.max(3, Math.round(currValueSize * 0.14));

        // Label
        ctx.textAlign = 'left';
        ctx.font = `bold ${currLabelSize}px "Changa", sans-serif`;
        ctx.fillStyle = row.isScore ? '#fdf4ff' : 'rgba(243, 232, 255, 0.95)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = textStrokeWidth;
        ctx.strokeText(row.label, labelX, curY);
        ctx.fillText(row.label, labelX, curY);

        // Value
        ctx.textAlign = 'right';
        ctx.font = `bold ${currValueSize}px "Changa", sans-serif`;
        ctx.fillStyle = row.color || '#ffffff';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = textStrokeWidth;
        ctx.strokeText(row.value, valueX, curY);
        ctx.fillText(row.value, valueX, curY);

        curY += rowHeight;
      }

      // 9. Prepare social share text & start sharing
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
