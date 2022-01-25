import { DOCUMENT } from '@angular/common';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import {
  LoadingManager,
  MathUtils,
  Texture,
  TextureLoader,
  Vector2,
} from 'three';
import { PLAYABLE_PIECE_COUNT } from '../../game-constants';
import { LevelMaterialType } from '../../models/level-material-type';
import { BumpMaterials, BumpSymbols, EmojiCodes } from './texture-info';

interface EmojiData {
  dataUrl: string;
  emojiCode: string;
}

@Injectable()
export class TextureManagerService {
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

      case LevelMaterialType.Emoji:
        const emojiData = this.initEmojiData();
        emojiData.forEach((data) => {
          this._textureLoader.load(data.dataUrl, (texture) => {
            texture.name = data.emojiCode;
            texture.center = new Vector2(0.5, 0.5);
            this._textures.push(texture);
          });
        });
        break;
    }
  }

  private loadBumpSymbols(): void {
    const bumpSymbolsLoaded = BumpSymbols.every((b) => b.texture);
    if (bumpSymbolsLoaded) {
      BumpSymbols.forEach((s) => {
        if (s.texture) {
          this._textures.push(s.texture);
        }
      });
      this.LevelTexturesLoaded.next();
    } else {
      // load and cache
      BumpSymbols.forEach((map) => {
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
      BumpMaterials[MathUtils.randInt(0, BumpMaterials.length - 1)];
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

  private initEmojiData(): EmojiData[] {
    const canvas = this.document.createElement('canvas');
    const scale = 80;
    canvas.width = canvas.height = scale;

    const data: EmojiData[] = [];

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const emojiSet = EmojiCodes[MathUtils.randInt(0, EmojiCodes.length - 1)];
      for (let i = 0; i < PLAYABLE_PIECE_COUNT; i++) {
        const emojiCode = emojiSet[i];

        ctx.clearRect(0, 0, scale, scale);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, scale, scale);

        ctx.font = scale - 10 + 'px Arial';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(String.fromCodePoint(emojiCode), scale / 2, scale / 2 + 8);
        data.push({ dataUrl: canvas.toDataURL(), emojiCode: emojiCode + '' });
      }
    }
    return data;
  }
}
