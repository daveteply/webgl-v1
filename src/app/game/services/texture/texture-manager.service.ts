import { DOCUMENT } from '@angular/common';
import { EventEmitter, Inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { StoreService } from 'src/app/app-store/services/store.service';

import { ClampToEdgeWrapping, LoadingManager, MathUtils, RepeatWrapping, Texture, TextureLoader, Vector2 } from 'three';
import {
  CANVAS_TEXTURE_SCALE,
  EMOJI_GROUP_PEOPLE_BODY,
  EMOJI_GROUP_SMILEYS_EMOTION,
  EMOJI_GROUP_STEP,
} from '../../game-constants';
import { LevelMaterialType } from '../../level-material-type';
import { PowerMoveType } from '../../models/power-move-type';
import { EmojiData } from './emoji-data';
import { BumpTextures, BumpSymbolTextures, PowerMoveTextures } from './texture-info';
import * as shuffleArray from 'shuffle-array';
import { LevelGeometryType } from '../../level-geometry-type';

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

  private _canvasElement!: HTMLCanvasElement;
  private _canvasContext!: CanvasRenderingContext2D | null;

  private _levelGeometryType!: LevelGeometryType;

  private _bumpTextures = BumpTextures;
  private _bumpSymbolTextures = BumpSymbolTextures;
  private _powerMoveTextures = PowerMoveTextures;

  private _textures: Texture[] = [];
  get Textures(): Texture[] {
    return this._textures;
  }

  public LevelTexturesLoaded: EventEmitter<void> = new EventEmitter();
  public LevelTextureLoadingStarted: EventEmitter<void> = new EventEmitter();
  public LevelTextureLoadProgress: EventEmitter<number> = new EventEmitter();
  public LevelTextureLoadError: EventEmitter<string> = new EventEmitter();

  constructor(@Inject(DOCUMENT) private document: Document, private store: StoreService) {
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

  public InitLevelTextures(
    playableTextureCount: number,
    levelMaterialType: LevelMaterialType,
    levelGeometryType: LevelGeometryType
  ): void {
    this.LevelTextureLoadingStarted.next();

    // level geometry type
    this._levelGeometryType = levelGeometryType;

    // clear existing textures
    this._textures = [];

    switch (levelMaterialType) {
      case LevelMaterialType.ColorBumpShape:
        this.loadBumpSymbolTextures();
        break;

      case LevelMaterialType.ColorBumpMaterial:
        this.loadBumpTextures();
        break;

      case LevelMaterialType.Emoji:
        const emojiList = this.initEmojiData(playableTextureCount);
        emojiList.forEach((data) => {
          this._textureLoader.load(data?.dataUrl || '', (texture) => {
            texture.name = data.desc;
            texture.center = new Vector2(0.5, 0.5);
            this.setTextureWrapping(texture);
            this._textures.push(texture);
          });
        });

        if (!environment.production) {
          emojiList.forEach((emoji) => console.info(`  ${emoji.desc} ${emoji.sequence}`));
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
              moveTexture.texture.wrapS = RepeatWrapping;
              moveTexture.texture.repeat.set(3, 1);
              observer.next(moveTexture.texture);
              observer.complete();
            },
            () => {},
            (error) => {
              observer.error(error);
            }
          );
        }
      }
    });
  }

  private loadBumpSymbolTextures(): void {
    const bumpSymbolsLoaded = this._bumpSymbolTextures.every((b) => b.texture);
    if (bumpSymbolsLoaded) {
      this._bumpSymbolTextures.forEach((s) => {
        if (s.texture) {
          this.setTextureWrapping(s.texture);
          this._textures.push(s.texture);
        }
      });
      this.LevelTexturesLoaded.next();
    } else {
      // load and cache
      this._bumpSymbolTextures.forEach((map) => {
        this._textureLoader.load(map.src, (data) => {
          data.center = new Vector2(0.5, 0.5);
          if (!environment.production) {
            data.name = map.src;
            console.info('Texture Manager: bump symbol texture caching ', data.name);
          }
          map.texture = data;
          this.setTextureWrapping(map.texture);
          this._textures.push(map.texture);
        });
      });
    }
  }

  private loadBumpTextures(): void {
    // select a random bump map
    const randBumpMaterialMap = this._bumpTextures[MathUtils.randInt(0, this._bumpTextures.length - 1)];
    // check if loaded
    if (randBumpMaterialMap.texture) {
      if (!environment.production) {
        console.info('Texture Manager: pulled bump texture from cache ', randBumpMaterialMap.src);
      }
      this.setTextureWrapping(randBumpMaterialMap.texture);
      this._textures.push(randBumpMaterialMap.texture);
      this.LevelTexturesLoaded.next();
    } else {
      // load and cache
      this._textureLoader.load(randBumpMaterialMap.src, (data) => {
        data.center = new Vector2(0.5, 0.5);
        if (!environment.production) {
          data.name = randBumpMaterialMap.src;
          console.info('Texture Manager: bump texture caching ', data.name);
        }
        randBumpMaterialMap.texture = data;
        this.setTextureWrapping(randBumpMaterialMap.texture);
        this._textures.push(randBumpMaterialMap.texture);
      });
    }
  }

  private initEmojiData(playableTextureCount: number): EmojiSequence[] {
    if (!this._canvasElement) {
      this._canvasElement = this.document.createElement('canvas');
      this._canvasElement.width = this._canvasElement.height = CANVAS_TEXTURE_SCALE;
    }

    if (!this._canvasContext) {
      this._canvasContext = this._canvasElement.getContext('2d');
    }

    let emojiSequence: EmojiSequence[] = [];

    if (this._canvasContext) {
      emojiSequence = this.randomEmojiCodeList(playableTextureCount);
      this.store.UpdateEmojiList(emojiSequence);

      for (let i = 0; i < emojiSequence.length; i++) {
        this._canvasContext.clearRect(0, 0, CANVAS_TEXTURE_SCALE, CANVAS_TEXTURE_SCALE);
        this._canvasContext.fillStyle = '#ffffff';
        this._canvasContext.fillRect(0, 0, CANVAS_TEXTURE_SCALE, CANVAS_TEXTURE_SCALE);

        this._canvasContext.font = CANVAS_TEXTURE_SCALE - 10 + 'px Arial';
        this._canvasContext.textBaseline = 'middle';
        this._canvasContext.textAlign = 'center';

        const emoji = emojiSequence[i];

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

  private randomEmojiCodeList(playableTextureCount: number): EmojiSequence[] {
    const emojiGroup = EmojiData[MathUtils.randInt(0, EmojiData.length - 1)];
    this.store.UpdateEmojiGroup(emojiGroup.id);

    // DEBUG
    // const targetGroupName = 'Smileys & Emotion';
    // emojiGroup = EmojiData.find((e) => e.id === targetGroupName) || EmojiData[0];
    // DEBUG

    if (!environment.production) {
      console.info('emoji group: ', emojiGroup.id);
    }

    const shuffledSubGroups = shuffleArray(emojiGroup.subGroup);
    // DEBUG
    // const shuffledSubGroups = emojiGroup.subGroup.filter((s) => s.id === 'arrow');
    // DEBUG

    // grab first 3 shuffled subgroups (some subgroups have a small number of sequences)
    const subGroups = shuffledSubGroups.slice(0, 3);
    this.store.UpdateEmojiSubGroups(subGroups.map((s) => s.id));

    // create long list of codes
    let targetSequences = [];
    const emojiSequences = subGroups.flatMap((s) => s.codes);

    // some groups are too similar to randomize, using stepped method instead
    if (emojiGroup.id === EMOJI_GROUP_PEOPLE_BODY || emojiGroup.id === EMOJI_GROUP_SMILEYS_EMOTION) {
      let inx = MathUtils.randInt(0, emojiSequences.length - 1);
      for (let i = 0; i < playableTextureCount; i++) {
        targetSequences.push(emojiSequences[inx]);
        inx += EMOJI_GROUP_STEP;
        if (inx >= emojiSequences.length) {
          inx = 0;
        }
      }
    } else {
      targetSequences = shuffleArray(emojiSequences);
    }

    return targetSequences
      .map((s) => {
        return { desc: s.desc, sequence: s.sequence, ver: s.version };
      })
      .slice(0, playableTextureCount);
  }

  private renderTest(canvasContext: CanvasRenderingContext2D) {
    if (canvasContext) {
      const imgData = canvasContext.getImageData(0, 0, CANVAS_TEXTURE_SCALE, CANVAS_TEXTURE_SCALE);
      // Note: this is checking every r, g, b, a value
      //  of every pixel every time.  Someday this should be
      //  a diagonal line test.
      if (imgData.data.every((d) => d === 255)) {
        const targetScale = CANVAS_TEXTURE_SCALE * 0.2;
        const targetStart = CANVAS_TEXTURE_SCALE / 2 - targetScale / 2;
        if (!environment.production) {
          console.info('  - Blank emoji, back-filling');
        }
        const randColor = Math.floor(Math.random() * 16777215).toString(16);
        canvasContext.fillStyle = `#${randColor}`;
        canvasContext.fillRect(targetStart, targetStart, targetScale, targetScale);
      }
    }
  }

  private setTextureWrapping(texture: Texture): void {
    if (texture) {
      // reset default
      texture.wrapS = ClampToEdgeWrapping;
      texture.repeat.set(1, 1);

      if (this._levelGeometryType === LevelGeometryType.Cylinder) {
        texture.wrapS = RepeatWrapping;
        texture.repeat.set(4, 1);
      }

      texture.needsUpdate = true;
    }
  }
}
