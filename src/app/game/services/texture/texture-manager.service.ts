import { DOCUMENT } from '@angular/common';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import * as shuffleArray from 'shuffle-array';
import { environment } from 'src/environments/environment';
import {
  LoadingManager,
  MathUtils,
  Texture,
  TextureLoader,
  Vector2,
} from 'three';
import { PLAYABLE_PIECE_COUNT } from '../../game-constants';
import { LevelMaterialType } from '../../models/level-material-type';
import { EmojiData } from './emoji-data';
import { BumpMaterials, BumpSymbols } from './texture-info';

interface EmojiSequence {
  desc: string;
  sequence: number[];
  ver: string;
  dataUrl?: string;
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
  public LevelTextureLoadingStarted: EventEmitter<void> = new EventEmitter();
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
    this.LevelTextureLoadingStarted.next();

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
        const emojiList = this.initEmojiData();
        emojiList.forEach((data) => {
          this._textureLoader.load(data?.dataUrl || '', (texture) => {
            texture.name = data.desc;
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
    const randBumpMaterialMap =
      BumpMaterials[MathUtils.randInt(0, BumpMaterials.length - 1)];
    // check if loaded
    if (randBumpMaterialMap.texture) {
      this._textures.push(randBumpMaterialMap.texture);
      this.LevelTexturesLoaded.next();
    } else {
      this._textureLoader.load(randBumpMaterialMap.src, (data) => {
        data.center = new Vector2(0.5, 0.5);
        data.name = randBumpMaterialMap.src;
        randBumpMaterialMap.texture = data;
        this._textures.push(randBumpMaterialMap.texture);
      });
    }
  }

  private initEmojiData(): EmojiSequence[] {
    const canvas = this.document.createElement('canvas');
    const scale = 80;
    canvas.width = canvas.height = scale;

    const emojiSequence = this.randomEmojiCodeList();

    const ctx = canvas.getContext('2d');
    if (ctx) {
      for (let i = 0; i < PLAYABLE_PIECE_COUNT; i++) {
        ctx.clearRect(0, 0, scale, scale);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, scale, scale);

        ctx.font = scale - 10 + 'px Arial';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        const emoji = emojiSequence[i];

        const emojiCode = String.fromCodePoint(...emoji.sequence);
        ctx.fillText(emojiCode, scale / 2, scale / 2 + 8);
        emoji.dataUrl = canvas.toDataURL();
      }
    }

    return emojiSequence;
  }

  private randomEmojiCodeList(): EmojiSequence[] {
    const emojiGroup = EmojiData[MathUtils.randInt(0, EmojiData.length - 1)];

    if (!environment.production) {
      console.info('emoji group: ', emojiGroup.id);
    }

    const shuffledSubGroups = shuffleArray(emojiGroup.subGroup);
    // grab first 3 shuffled subgroups (some subgroups have a small number of sequences)
    const emojiSequences = shuffledSubGroups
      .slice(0, 3)
      .flatMap((s) => s.codes);
    const shuffledSequences = shuffleArray(emojiSequences);

    return shuffledSequences.map((s) => {
      return { desc: s.desc, sequence: s.sequence, ver: s.version };
    });
  }
}
