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

export interface BumpData {
  src: string;
  texture?: Texture;
}

@Injectable()
export class TextureManagerService {
  private _bumpMaterials: BumpData[] = [
    { src: 'assets/maps/bump/material/bark-1.jpg' },
    { src: 'assets/maps/bump/material/bark-2.jpg' },
    { src: 'assets/maps/bump/material/brick-1.jpg' },
    { src: 'assets/maps/bump/material/brick-2.jpg' },
    { src: 'assets/maps/bump/material/concrete-1.jpg' },
    { src: 'assets/maps/bump/material/fabric-1.jpg' },
    { src: 'assets/maps/bump/material/fabric-2.jpg' },
    { src: 'assets/maps/bump/material/fabric-3.jpg' },
    { src: 'assets/maps/bump/material/gravel-1.jpg' },
    { src: 'assets/maps/bump/material/metal-1.jpg' },
    { src: 'assets/maps/bump/material/metal-2.jpg' },
    { src: 'assets/maps/bump/material/plastic-1.jpg' },
    { src: 'assets/maps/bump/material/rubber-1.jpg' },
  ];

  private _bumpSymbols: BumpData[] = [
    { src: 'assets/maps/bump/symbol/box.jpg' },
    { src: 'assets/maps/bump/symbol/diamond.jpg' },
    { src: 'assets/maps/bump/symbol/dits.jpg' },
    { src: 'assets/maps/bump/symbol/flake.jpg' },
    { src: 'assets/maps/bump/symbol/plus.jpg' },
    { src: 'assets/maps/bump/symbol/sun.jpg' },
  ];

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
      case LevelMaterialType.ColorBumpShape:
        this.loadBumpSymbols();
        break;

      case LevelMaterialType.ColorBumpMaterial:
        this.loadBumpMaterials();
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

  private loadBumpSymbols(): void {
    const bumpSymbolsLoaded = this._bumpSymbols.every((b) => b.texture);
    if (bumpSymbolsLoaded) {
      this._bumpSymbols.forEach((s) => {
        if (s.texture) {
          this._textures.push(s.texture);
        }
      });
      this.LevelTexturesLoaded.next();
    } else {
      // load and cache
      this._bumpSymbols.forEach((map) => {
        this._textureLoader.load(map.src, (data) => {
          data.name = map.src;
          map.texture = data;
          this._textures.push(map.texture);
        });
      });
    }
  }

  private loadBumpMaterials(): void {
    // select a bump map
    const randMaterialMap =
      this._bumpMaterials[MathUtils.randInt(0, this._bumpMaterials.length - 1)];
    // check if loaded
    if (randMaterialMap.texture) {
      this._textures.push(randMaterialMap.texture);
      this.LevelTexturesLoaded.next();
    } else {
      this._textureLoader.load(randMaterialMap.src, (data) => {
        data.center = new Vector2(0.5, 0.5);
        data.name = randMaterialMap.src;
        randMaterialMap.texture = data;
        this._textures.push(randMaterialMap.texture);
      });
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

        ctx.font = scale - 10 + 'px Arial';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(String.fromCodePoint(emojiCode), scale / 2, scale / 2 + 8);
        dataUrls.push(canvas.toDataURL());
      }
    }
    return dataUrls;
  }
}
