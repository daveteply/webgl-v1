import { DOCUMENT } from '@angular/common';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import {
  LoadingManager,
  MathUtils,
  Texture,
  TextureLoader,
  Vector2,
} from 'three';
import { PLAYABLE_PIECE_COUNT } from '../game-constants';
import { LevelMaterialType } from '../models/level-material-type';

@Injectable()
export class TextureManagerService {
  private _bumpMaps: string[] = [
    'assets/maps-bump/Bark 0499.JPG.jpg',
    'assets/maps-bump/Bark 0515.JPG.jpg',
    'assets/maps-bump/Brick 2371 bump map.jpg',
    'assets/maps-bump/Brick 2852b bump map.jpg',
    'assets/maps-bump/Concrete 3035 bump map.jpg',
    'assets/maps-bump/Fabric 0071 bump map.jpg',
    'assets/maps-bump/Fabric 0106.jpg',
    'assets/maps-bump/Fabric 0136c.jpg',
    'assets/maps-bump/Fabric 0140c.jpg',
    'assets/maps-bump/Gravel 2486 bump map.jpg',
    'assets/maps-bump/Metal 2350 bump map.jpg',
    'assets/maps-bump/Metal 2860 bump map.jpg',
    'assets/maps-bump/Plastic 2923f.jpg',
    'assets/maps-bump/Rubber 0472.jpg',
  ];
  private _bumpMapsCache: Texture[] = [];

  private _emojiCodes: number[][] = [
    [0x1f600, 0x1f604, 0x1f609, 0x1f60a, 0x1f607, 0x1f923],
    [0x1f637, 0x1f634, 0x1f925, 0x1f970, 0x1f928, 0x1f92b],
    [0x1f917, 0x1f911, 0x1f61d, 0x1f92a, 0x1f60b, 0x1f60f],
    [0x1f975, 0x1f976, 0x1f974, 0x1f92f, 0x1f920, 0x1f978],
  ];

  private _loaderManager: LoadingManager;
  private _textureLoader: TextureLoader;

  private _textures: Texture[] = [];
  get Textures(): Texture[] {
    return this._textures;
  }

  private _levelType!: LevelMaterialType;
  get LevelType(): LevelMaterialType {
    return this._levelType;
  }

  public LevelTexturesLoaded: EventEmitter<void> = new EventEmitter();
  public LevelTextureLoadProgress: EventEmitter<number> = new EventEmitter();
  public LevelTextureLoadError: EventEmitter<string> = new EventEmitter();

  constructor(@Inject(DOCUMENT) private document: Document) {
    this._loaderManager = new LoadingManager(
      // all images loaded
      () => {
        this.LevelTexturesLoaded.next();
      },
      // progress
      (url: string, itemsLoaded: number, itemsTotal: number) => {
        this.LevelTextureLoadProgress.next((itemsLoaded / itemsTotal) * 100);
      },
      // error
      (url: string) => {
        this.LevelTextureLoadError.next(url);
      }
    );
    this._textureLoader = new TextureLoader(this._loaderManager);
  }

  public InitLevelTextures(levelType: LevelMaterialType): void {
    // set level type
    this._levelType = levelType;

    // clear existing textures
    this._textures.forEach((texture) => texture.dispose);
    this._textures = [];

    switch (this._levelType) {
      case LevelMaterialType.ColorOnly:
        this.LevelTexturesLoaded.next();
        break;

      case LevelMaterialType.ColorAndBumpMaps:
        // select a bump map
        const randBumpMap =
          this._bumpMaps[MathUtils.randInt(0, this._bumpMaps.length - 1)];
        const cachedTexture = this._bumpMapsCache.find(
          (b) => b.name === randBumpMap
        );
        if (cachedTexture) {
          this._textures.push(cachedTexture);
          this.LevelTexturesLoaded.next();
        } else {
          this._textureLoader.load(randBumpMap, (texture) => {
            texture.center = new Vector2(0.5, 0.5);
            texture.name = randBumpMap;
            this._textures.push(texture);
            this._bumpMapsCache.push(texture);
          });
        }
        break;

      default:
        const dataURLs = this.initEmojiData();
        dataURLs.forEach((d) => {
          this._textureLoader.load(d, (texture) => {
            texture.center = new Vector2(0.5, 0.5);
            this._textures.push(texture);
          });
        });
        break;
    }
  }

  private initEmojiData(): string[] {
    const canvas = this.document.createElement('canvas');
    const scale = 80;
    canvas.width = canvas.height = scale;

    const dataUrls: string[] = [];

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const emojiSet =
        this._emojiCodes[MathUtils.randInt(0, this._emojiCodes.length - 1)];
      for (let i = 0; i < PLAYABLE_PIECE_COUNT; i++) {
        const emojiCode = emojiSet[i];

        ctx.clearRect(0, 0, scale, scale);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, scale, scale);

        ctx.font = scale - 5 + 'px Arial';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(String.fromCodePoint(emojiCode), scale / 2, scale / 2 + 5);
        dataUrls.push(canvas.toDataURL());
      }
    }
    return dataUrls;
  }
}
