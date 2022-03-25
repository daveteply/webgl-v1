import { Injectable } from '@angular/core';

import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { Group, LoadingManager, Scene } from 'three';
import { SplashText } from './splash-text';
import { TextSplashEventType } from './text-splash-event-type';

@Injectable({
  providedIn: 'root',
})
export class TextManagerService {
  private _loadingManager: LoadingManager;
  private _fontLoader: FontLoader;

  private _robotoRegular!: Font;

  private _scene!: Scene;

  private _queue: SplashText[] = [];
  private _textGroup!: Group;

  constructor() {
    this._loadingManager = new LoadingManager(
      () => {
        // console.log('fonts loaded');
      }, // progress
      (url: string, itemsLoaded: number, itemsTotal: number) => {
        //console.log('font progress', url, itemsLoaded, itemsTotal);
      },
      // error
      (url: string) => {
        // console.log('font bummer', url);
      }
    );
    this._fontLoader = new FontLoader(this._loadingManager);
  }

  public InitFonts(): void {
    this._fontLoader.load('assets/fonts/typeface/Roboto_Regular.json', (response) => {
      this._robotoRegular = response;
    });
  }

  public InitScene(scene: Scene): void {
    this._textGroup = new Group();
    this._textGroup.name = 'textGroup';
    this._textGroup.position.y = -2.0;
    this._textGroup.position.z = -3.0;

    this._scene = scene;
    this._scene.add(this._textGroup);
  }

  public ShowText(message: string[]): void {
    if (!this._robotoRegular) {
      return;
    }

    if (message?.length) {
      message.forEach((msg) => {
        this._queue.push(new SplashText(msg, this._robotoRegular));
      });
    }

    this.nextText();
  }

  private nextText(): void {
    const next = this._queue.shift();
    if (next) {
      this._textGroup.add(next);
      const sub = next.Animate$.subscribe((nextEvent) => {
        switch (nextEvent) {
          case TextSplashEventType.IntroComplete:
            this.nextText();
            break;

          case TextSplashEventType.OutroComplete:
            next.Dispose();
            sub.unsubscribe();
            this._textGroup.remove(next);
            break;
        }
      });
    }
  }
}
