import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Share } from '@capacitor/share';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { SHARE_FILE_NAME } from '../game-constants';

@Injectable({
  providedIn: 'root',
})
export class ShareManagerService {
  private _screenShotRequested: boolean = false;
  get ScreenShotRequested(): boolean {
    return this._screenShotRequested;
  }

  private _document!: Document;

  private _inLevel: boolean = false;
  get InLevel(): boolean {
    return this._inLevel;
  }

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
      // save screen shot as image
      var image = new Image();
      image.onload = (onLoadResult) => {
        const img = onLoadResult.target as HTMLImageElement;
        if (img) {
          // use in-memory canvas to create new image
          const canvas = this._document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // draw existing screen shot
            ctx.font = '130px Chau Philomene One';
            ctx.drawImage(img, 0, 0);

            // overlay text
            ctx.fillText('TEST TEXT !!! OMG THIS IS SO COOL', 100, 100);

            this.debugDownloadFile(canvas.toDataURL());
          }
        }
      };
      image.src = screenShotDataUrl;

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
