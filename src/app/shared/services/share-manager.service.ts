import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { Share, ShareResult } from '@capacitor/share';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root',
})
export class ShareManagerService {
  private _screenShotRequested: boolean = false;
  get ScreenShotRequested(): boolean {
    return this._screenShotRequested;
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
            console.log('write Result', JSON.stringify(writeResult));
            this.shareContent('example title', 'example text', writeResult.uri)
              .pipe(take(1))
              .subscribe((result) => {
                console.log(result);
              });
          })
          .catch((fileWriteError) => {
            console.log('file write error', fileWriteError);
          });
      }
    }
  }

  private shareContent(title: string, text: string, url: string): Observable<ShareResult> {
    return new Observable((observer) => {
      Share.share({ title, text, url })
        .then((result) => {
          console.log('share complete', JSON.stringify(result));
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          console.log('share error', JSON.stringify(error));
        });
    });
  }
}
