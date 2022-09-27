import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { Share } from '@capacitor/share';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { SHARE_FILE_NAME } from '../game-constants';
import { formatNumber } from '@angular/common';
import { ScoringManagerService } from './scoring-manager.service';

@Injectable()
export class ShareManagerService {
  private _screenShotRequested: boolean = false;
  get ScreenShotRequested(): boolean {
    return this._screenShotRequested;
  }

  private _document!: Document;
  private _rikkleLogo!: HTMLImageElement;

  private _inLevel: boolean = false;
  get InLevel(): boolean {
    return this._inLevel;
  }

  constructor(private scoringManager: ScoringManagerService) {}

  UpdateInLevel(inLevel: boolean): void {
    this._inLevel = inLevel;
  }

  CanShare(): Observable<boolean> {
    return new Observable((observer) => {
      Share.canShare().then((result) => {
        observer.next(result.value);
        observer.complete();
      });
    });
  }

  RequestScreenShot(docReference: Document): void {
    this._document = docReference;
    this._screenShotRequested = true;
  }

  UpdateScreenShotData(screenShotDataUrl: string): void {
    this._screenShotRequested = false;

    if (screenShotDataUrl) {
      // load rikkle logo
      this.loadRikkleLogo()
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.createScreenShot(screenShotDataUrl);
          },
          error: () => {
            console.error('Failure loading Rikkle logo');
            this.createScreenShot(screenShotDataUrl, false);
          },
        });

      // const screenShotSegments = screenShotDataUrl.split(',');
      // if (screenShotSegments.length === 2) {
      //   const imageData = screenShotSegments[1];

      //   Filesystem.writeFile({ path: SHARE_FILE_NAME, data: imageData, directory: Directory.Cache })
      //     .then((writeResult) => {
      //       Share.share({ title: 'example title', text: 'example text', url: writeResult.uri })
      //         .then((result) => {
      //           console.log('share complete', JSON.stringify(result));
      //         })
      //         .catch((error) => {
      //           console.error('share error', JSON.stringify(error));
      //         });
      //     })
      //     .catch((fileWriteError) => {
      //       console.error('file write error', fileWriteError);
      //     });
      // }
    }
  }

  private loadRikkleLogo(): Observable<void> {
    return new Observable((observer) => {
      if (!this._rikkleLogo) {
        const rikkleLogoImage = new Image();
        // set up events
        rikkleLogoImage.onload = (onloadEvent: Event) => {
          this._rikkleLogo = onloadEvent.target as HTMLImageElement;
          observer.next();
          observer.complete();
        };
        rikkleLogoImage.onerror = () => {
          observer.error();
          observer.complete();
        };

        // initiate download
        rikkleLogoImage.src = '/assets/rikkle-logo.webp';
      } else {
        observer.next();
        observer.complete();
      }
    });
  }

  private createScreenShot(screenShotDataUrl: string, useLogo: boolean = true): void {
    // save screen shot as image
    const screenShotImage = new Image();
    screenShotImage.onload = (onLoadResult) => {
      const img = onLoadResult.target as HTMLImageElement;
      if (img) {
        // use in-memory canvas to create new image
        const canvas = this._document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // draw existing screen shot
          ctx.drawImage(img, 0, 0);

          // add gradient
          const height = img.height * 0.45;
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, 'black');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, img.width, height);

          // draw Rikkle logo
          if (useLogo) {
            ctx.drawImage(this._rikkleLogo, img.width / 2 - this._rikkleLogo.width / 2, 100);
          }

          // overlay text
          ctx.textAlign = 'center';
          ctx.font = '10em "Chau Philomene One"';
          ctx.fillStyle = 'white';
          const textX = this._rikkleLogo.height + 200;
          ctx.fillText(`Level: ${this.scoringManager.Level}`, img.width / 2, textX);
          ctx.fillText(`Score: ${formatNumber(this.scoringManager.Score, 'en-US')}`, img.width / 2, textX + 100);

          this.debugDownloadFile(canvas.toDataURL());
        }
      }
    };
    screenShotImage.src = screenShotDataUrl;
  }

  private debugDownloadFile(data: string): void {
    const a = document.createElement('a');
    a.download = 'foo.png';
    a.href = data;
    document.body.appendChild(a);
    a.click();

    // clean up
    document.body.removeChild(a);
  }
}
