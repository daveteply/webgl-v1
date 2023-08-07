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

  private _changaRegular!: Font;

  private _scene!: Scene;

  private _queue: SplashText[] = [];
  private _textGroup!: Group;

  private _isPresenting = false;

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
    this._fontLoader.load('./assets/fonts/typeface/Changa_Regular.json', (response) => {
      this._changaRegular = response;
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

  public ShowText(message: string[], color?: number): void {
    if (!this._changaRegular) {
      return;
    }

    if (message?.length) {
      let yOffset = 0;
      message.forEach((msg) => {
        this._queue.push(new SplashText(msg, this._changaRegular, yOffset, color));
        yOffset -= 0.75;
      });
    }

    this.nextText();
  }

  private nextText(): void {
    if (!this._isPresenting) {
      const next = this._queue.shift();
      if (next) {
        this._textGroup.add(next);
        this._isPresenting = true;
        const sub = next.AnimateText().subscribe((nextEvent) => {
          switch (nextEvent) {
            case TextSplashEventType.IntroComplete:
              this._isPresenting = false;
              this.nextText();
              break;

            case TextSplashEventType.OutroComplete:
              this._textGroup.remove(next);
              next.Dispose();
              sub.unsubscribe();
              break;
          }
        });
      }
    }
  }
}
