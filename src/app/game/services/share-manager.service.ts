import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Share } from '@capacitor/share';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root',
})
export class ShareManagerService {
  private _screenShotRequested: boolean = false;
  get ScreenShotRequested(): boolean {
    return this._screenShotRequested;
  }

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

  RequestScreenShot(): void {
    this._screenShotRequested = true;
  }

  UpdateScreenShotData(screenShotData: string): void {
    this._screenShotRequested = false;

    if (screenShotData) {
      const screenShotSegments = screenShotData.split(',');
      if (screenShotSegments.length === 2) {
        const imageData = screenShotSegments[1];
        Filesystem.writeFile({ path: 'rikkle-screen-shot.png', data: imageData, directory: Directory.Cache })
          .then((writeResult) => {
            Share.share({ title: 'example title', text: 'example text', url: writeResult.uri })
              .then((result) => {
                console.log('share complete', JSON.stringify(result));
              })
              .catch((error) => {
                console.error('share error', JSON.stringify(error));
              });
          })
          .catch((fileWriteError) => {
            console.error('file write error', fileWriteError);
          });
      }
    }
  }
}
