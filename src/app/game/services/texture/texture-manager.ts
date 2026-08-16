import { DOCUMENT } from '@angular/common';
import { Injectable, inject, isDevMode } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { StoreService } from '../../../app-store/services/store.service';

import {
  ClampToEdgeWrapping,
  LoadingManager,
  MathUtils,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
} from 'three';
import { CANVAS_TEXTURE_SCALE } from '../../game-constants';
import { LevelMaterialType } from '../../level-material-type';
import { PowerMoveType } from '../../models/power-move-type';
import { EmojiData } from './emoji-data';
import { BumpTextures, BumpSymbolTextures, PowerMoveTextures } from './texture-info';
import arrayShuffle from '../../../shared/utils/array-shuffle';
import { LevelGeometryType } from '../../level-geometry-type';
import { GameTexture } from './game-texture';
import { PRNG } from '../../../shared/utils/prng';

interface EmojiSequence {
  desc: string;
  sequence: number[];
  ver: string;
  dataUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TextureManagerService {
  private document = inject(DOCUMENT);
  private store = inject(StoreService);

  private _loaderManager: LoadingManager;
  private _textureLoader: TextureLoader;

  private _canvasElement!: HTMLCanvasElement;
  private _canvasContext!: CanvasRenderingContext2D | null;

  private _levelGeometryType!: LevelGeometryType;
  private _levelMaterialType!: LevelMaterialType;

  private _bumpTextures = BumpTextures;
  private _bumpSymbolTextures = BumpSymbolTextures;
  private _powerMoveTextures = PowerMoveTextures;

  private _textures: GameTexture[] = [];
  get Textures(): GameTexture[] {
    return this._textures;
  }

  public LevelTextureLoadingStarted: Subject<void> = new Subject<void>();
  public LevelTexturesLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public LevelTextureLoadProgress: Subject<number> = new Subject<number>();
  public LevelTextureLoadError: Subject<string> = new Subject<string>();

  constructor() {
    this._loaderManager = new LoadingManager(
      // all images loaded
      () => {
        this.emitCompletion();
      },
      // progress
      (url: string, itemsLoaded: number, itemsTotal: number) => {
        this.LevelTextureLoadProgress.next((itemsLoaded / itemsTotal) * 100);
      },
      // error
      (url: string) => {
        this.LevelTextureLoadError.next(url);
      },
    );
    this._textureLoader = new TextureLoader(this._loaderManager);
  }

  public InitLevelTextures(
    playableTextureCount: number,
    levelMaterialType: LevelMaterialType,
    levelGeometryType: LevelGeometryType,
    rng?: PRNG,
  ): void {
    this.LevelTexturesLoaded.next(false);
    this.LevelTextureLoadingStarted.next();

    // level geometry type
    this._levelGeometryType = levelGeometryType;

    // material type
    this._levelMaterialType = levelMaterialType;

    // clear existing textures
    this._textures = [];
    let emojiList: EmojiSequence[];

    switch (this._levelMaterialType) {
      case LevelMaterialType.ColorBumpShape:
        this.loadBumpSymbolTextures(playableTextureCount, rng);
        break;

      case LevelMaterialType.ColorBumpMaterial:
        this.loadBumpTextures(rng);
        break;

      case LevelMaterialType.Emoji:
        emojiList = this.initEmojiData(playableTextureCount, rng);
        emojiList.forEach((data) => {
          this._textureLoader.load(data?.dataUrl || '', (texture) => {
            const gameTexture: GameTexture = { id: data.desc, texture: texture };
            gameTexture.texture.userData = { sequence: data.sequence };
            gameTexture.texture.center = new Vector2(0.5, 0.5);
            this.setTextureWrapping(gameTexture.texture);
            this._textures.push(gameTexture);
          });
        });

        if (isDevMode()) {
          console.info(emojiList.map((emoji) => `  ${emoji.desc} ${emoji.sequence}`).join('\n'));
        }
        break;
    }
  }

  public GetPowerMoveTexture(moveType: PowerMoveType): Observable<Texture> {
    return new Observable((observer) => {
      const moveTexture = this._powerMoveTextures.find((pt) => pt.moveType === moveType);
      if (moveTexture) {
        if (moveTexture?.texture) {
          observer.next(moveTexture.texture);
          observer.complete();
        } else {
          new TextureLoader().load(
            moveTexture.src,
            (data) => {
              moveTexture.texture = data;
              moveTexture.texture.colorSpace = SRGBColorSpace;
              moveTexture.texture.wrapS = RepeatWrapping;
              moveTexture.texture.repeat.set(3, 1);
              observer.next(moveTexture.texture);
              observer.complete();
            },
            () => {
              // no op
            },
            (error) => {
              observer.error(error);
            },
          );
        }
      }
    });
  }

  private loadBumpSymbolTextures(playableTextureCount: number, rng?: PRNG): void {
    const targetTextures = arrayShuffle(this._bumpSymbolTextures, rng).slice(0, playableTextureCount);

    // loaded
    const loadedTextures = targetTextures.filter((t) => t.texture);
    for (const texture of loadedTextures) {
      if (texture.texture) {
        const gameTexture: GameTexture = { id: texture.id, texture: texture.texture };
        this.setTextureWrapping(gameTexture.texture, true);
        this._textures.push(gameTexture);
      }
    }
    if (targetTextures.every((t) => t.texture)) {
      this.emitCompletion();
    } else {
      // need to load
      const needLoadedTextures = targetTextures.filter((t) => !t.texture);
      for (const texture of needLoadedTextures) {
        this._textureLoader.load(texture.src, (data) => {
          const gameTexture: GameTexture = { id: texture.id, texture: data };
          gameTexture.texture.center = new Vector2(0.5, 0.5);
          this.setTextureWrapping(gameTexture.texture, true);
          this._textures.push(gameTexture);

          // cache
          texture.texture = data;
        });
      }
    }
  }

  private loadBumpTextures(rng?: PRNG): void {
    const inx = rng
      ? rng.nextInt(0, this._bumpTextures.length - 1)
      : MathUtils.randInt(0, this._bumpTextures.length - 1);
    const randBumpMaterialMap = this._bumpTextures[inx];

    // check if loaded
    if (randBumpMaterialMap.texture) {
      this.setTextureWrapping(randBumpMaterialMap.texture, true);
      this._textures.push({ id: randBumpMaterialMap.id, texture: randBumpMaterialMap.texture });
      this.emitCompletion();
    } else {
      // load and cache
      this._textureLoader.load(randBumpMaterialMap.src, (data) => {
        data.center = new Vector2(0.5, 0.5);
        randBumpMaterialMap.texture = data;
        this.setTextureWrapping(randBumpMaterialMap.texture, true);
        this._textures.push({ id: randBumpMaterialMap.id, texture: randBumpMaterialMap.texture });
      });
    }
  }

  private initEmojiData(playableTextureCount: number, rng?: PRNG): EmojiSequence[] {
    if (!this._canvasElement) {
      this._canvasElement = this.document.createElement('canvas');
      this._canvasElement.width = this._canvasElement.height = CANVAS_TEXTURE_SCALE;
    }

    if (!this._canvasContext) {
      this._canvasContext = this._canvasElement.getContext('2d');
    }

    let emojiSequence: EmojiSequence[] = [];

    if (this._canvasContext) {
      emojiSequence = this.randomEmojiCodeList(playableTextureCount, rng);
      this.store.UpdateEmojiList(emojiSequence);

      for (const emoji of emojiSequence) {
        this._canvasContext.clearRect(0, 0, CANVAS_TEXTURE_SCALE, CANVAS_TEXTURE_SCALE);
        this._canvasContext.fillStyle = '#ffffff';
        this._canvasContext.fillRect(0, 0, CANVAS_TEXTURE_SCALE, CANVAS_TEXTURE_SCALE);

        this._canvasContext.font = CANVAS_TEXTURE_SCALE - 10 + 'px Arial';
        this._canvasContext.textBaseline = 'middle';
        this._canvasContext.textAlign = 'center';

        const emojiCode = String.fromCodePoint(...emoji.sequence);
        this._canvasContext.fillText(emojiCode, CANVAS_TEXTURE_SCALE / 2, CANVAS_TEXTURE_SCALE / 2 + 8);

        // white pixel test (incompatible emojis)
        this.renderTest(this._canvasContext);

        // set data Url (to be used by three js texture engine)
        emoji.dataUrl = this._canvasElement.toDataURL();
      }
    }

    return emojiSequence;
  }

  private randomEmojiCodeList(playableTextureCount: number, rng?: PRNG): EmojiSequence[] {
    const groupInx = rng ? rng.nextInt(0, EmojiData.length - 1) : MathUtils.randInt(0, EmojiData.length - 1);
    const emojiGroup = EmojiData[groupInx];
    this.store.UpdateEmojiGroup(emojiGroup.id);

    if (isDevMode()) {
      console.info('emoji group: ', emojiGroup.id);
    }

    const shuffledSubGroups = arrayShuffle(emojiGroup.subGroup, rng);

    // grab first 5 shuffled subgroups (some subgroups have a small number of sequences)
    const subGroups = shuffledSubGroups.slice(0, 5);
    this.store.UpdateEmojiSubGroups(subGroups.map((s) => s.id));

    // create long list of codes
    const emojiSequences = subGroups.flatMap((s) => s.codes);
    return arrayShuffle(emojiSequences, rng)
      .map((s) => {
        return { desc: s.desc, sequence: s.sequence, ver: s.version };
      })
      .slice(0, playableTextureCount);
  }

  private renderTest(canvasContext: CanvasRenderingContext2D) {
    if (canvasContext) {
      const imgData = canvasContext.getImageData(0, 0, CANVAS_TEXTURE_SCALE, CANVAS_TEXTURE_SCALE);
      const data = imgData.data;
      const width = CANVAS_TEXTURE_SCALE;
      let isBlank = true;

      // Diagonal line test sampling pixels along (i, i)
      const step = 4;
      for (let i = 0; i < width; i += step) {
        const offset = (i * width + i) * 4;
        if (data[offset] !== 255 || data[offset + 1] !== 255 || data[offset + 2] !== 255) {
          isBlank = false;
          break;
        }
      }

      if (isBlank) {
        const targetScale = CANVAS_TEXTURE_SCALE * 0.2;
        const targetStart = CANVAS_TEXTURE_SCALE / 2 - targetScale / 2;
        if (isDevMode()) {
          console.info('  - Blank emoji, back-filling');
        }
        const randColor = Math.floor(Math.random() * 16777215).toString(16);
        canvasContext.fillStyle = `#${randColor}`;
        canvasContext.fillRect(targetStart, targetStart, targetScale, targetScale);
      }
    }
  }

  private setTextureWrapping(texture: Texture, isBumpMap = false): void {
    if (texture) {
      // reset default
      texture.wrapS = ClampToEdgeWrapping;
      texture.repeat.set(1, 1);

      if (isBumpMap) {
        texture.colorSpace = NoColorSpace;
      } else {
        texture.colorSpace = SRGBColorSpace;
      }

      if (this._levelGeometryType === LevelGeometryType.Cylinder) {
        texture.wrapS = RepeatWrapping;
        texture.repeat.set(4, 1);
      }

      texture.needsUpdate = true;
    }
  }

  private emitCompletion(): void {
    this.LevelTexturesLoaded.next(true);
  }
}

export { TextureManagerService as TextureManager };
