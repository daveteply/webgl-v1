import { DOCUMENT } from '@angular/common';
import { Injectable, inject, isDevMode } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { GameStateStore } from '@rikkle/state';

import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  LoadingManager,
  MathUtils,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
} from 'three';
import {
  CANVAS_TEXTURE_SCALE,
  LevelMaterialType,
  LevelGeometryType,
  LevelOrientationType,
  PowerMoveType,
} from '@rikkle/engine';
import {
  detectMaxSupportedEmojiVersion,
  filterSupportedEmojis,
  EmojiCode,
  EmojiGroup,
  EmojiDataPayload,
  EMOJI_FONT_STACK,
} from './emoji-support';
import { BumpTextures, BumpSymbolTextures, PowerMoveTextures } from './texture-info';
import { arrayShuffle, PRNG } from '@rikkle/shared';
import { GameTexture } from './game-texture';

@Injectable({
  providedIn: 'root',
})
export class TextureManagerService {
  private document = inject(DOCUMENT);
  private store = inject(GameStateStore);

  private _loaderManager: LoadingManager;
  private _textureLoader: TextureLoader;

  private _emojiDataCache: EmojiGroup[] | null = null;
  private _maxSupportedEmojiVersion: number | null = null;
  private _isEmojiLoading = false;

  private _levelGeometryType!: LevelGeometryType;
  private _levelMaterialType!: LevelMaterialType;
  private _levelOrientationType: LevelOrientationType = LevelOrientationType.Vertical;

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

  public SetEmojiDataCache(groups: EmojiGroup[]): void {
    this._emojiDataCache = groups;
  }

  public async PreloadEmojiData(): Promise<void> {
    if (this._emojiDataCache || this._isEmojiLoading) return;
    try {
      await this.fetchEmojiData();
    } catch {
      // Background preload can fail silently
    }
  }

  public InitLevelTextures(
    playableTextureCount: number,
    levelMaterialType: LevelMaterialType,
    levelGeometryType: LevelGeometryType,
    rng?: PRNG,
    levelOrientationType: LevelOrientationType = LevelOrientationType.Vertical,
  ): void {
    this.LevelTexturesLoaded.next(false);
    this.LevelTextureLoadingStarted.next();

    // level geometry type
    this._levelGeometryType = levelGeometryType;

    // material type
    this._levelMaterialType = levelMaterialType;

    // level orientation type
    this._levelOrientationType = levelOrientationType;

    // clear existing textures
    this._textures = [];

    switch (this._levelMaterialType) {
      case LevelMaterialType.ColorBumpShape:
        this.loadBumpSymbolTextures(playableTextureCount, rng);
        break;

      case LevelMaterialType.ColorBumpMaterial:
        this.loadBumpTextures(rng);
        break;

      case LevelMaterialType.Emoji:
        this.loadEmojiTextures(playableTextureCount, rng);
        break;

      case LevelMaterialType.Color:
        this.emitCompletion();
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

  private async loadEmojiTextures(playableTextureCount: number, rng?: PRNG): Promise<void> {
    try {
      this.LevelTextureLoadProgress.next(25);
      const emojiGroups = await this.fetchEmojiData();
      this.LevelTextureLoadProgress.next(60);

      const selectedEmojis = this.randomEmojiCodeList(emojiGroups, playableTextureCount, rng);
      this.store.updateEmojiList(
        selectedEmojis.map((s) => ({
          desc: s.desc,
          sequence: s.sequence,
        })),
      );

      for (const emoji of selectedEmojis) {
        const gameTexture = this.createEmojiTexture(emoji);
        this._textures.push(gameTexture);
      }

      if (isDevMode()) {
        console.info(selectedEmojis.map((emoji) => `  ${emoji.desc} ${emoji.sequence}`).join('\n'));
      }

      this.LevelTextureLoadProgress.next(100);
      this.emitCompletion();
    } catch (err) {
      console.error('Error loading emoji textures:', err);
      this.LevelTextureLoadError.next('emoji-data');
      this.emitCompletion();
    }
  }

  private createEmojiTexture(emoji: EmojiCode): GameTexture {
    const canvas = this.document.createElement('canvas');
    canvas.width = CANVAS_TEXTURE_SCALE;
    canvas.height = CANVAS_TEXTURE_SCALE;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_TEXTURE_SCALE, CANVAS_TEXTURE_SCALE);

      const fontSize = Math.floor(CANVAS_TEXTURE_SCALE * 0.72);
      ctx.font = `${fontSize}px ${EMOJI_FONT_STACK}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      const emojiCode = String.fromCodePoint(...emoji.sequence);
      const metrics = ctx.measureText(emojiCode);
      let y = CANVAS_TEXTURE_SCALE / 2;
      if (metrics.actualBoundingBoxAscent && metrics.actualBoundingBoxDescent) {
        y = (CANVAS_TEXTURE_SCALE + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
      }
      ctx.fillText(emojiCode, CANVAS_TEXTURE_SCALE / 2, y);
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    texture.center = new Vector2(0.5, 0.5);
    texture.userData = { sequence: emoji.sequence };
    this.setTextureWrapping(texture);

    return {
      id: emoji.desc,
      texture,
    };
  }

  private randomEmojiCodeList(emojiGroups: EmojiGroup[], playableTextureCount: number, rng?: PRNG): EmojiCode[] {
    if (!emojiGroups.length) return [];
    const groupInx = rng ? rng.nextInt(0, emojiGroups.length - 1) : MathUtils.randInt(0, emojiGroups.length - 1);
    const emojiGroup = emojiGroups[groupInx];
    this.store.updateEmojiGroup(emojiGroup.id);

    if (isDevMode()) {
      console.info('emoji group: ', emojiGroup.id);
    }

    const shuffledSubGroups = arrayShuffle(emojiGroup.subGroup, rng);
    const subGroups = shuffledSubGroups.slice(0, 5);
    this.store.updateEmojiSubGroups(subGroups.map((s) => s.id));

    const emojiSequences = subGroups.flatMap((s) => s.codes);
    return arrayShuffle(emojiSequences, rng).slice(0, playableTextureCount);
  }

  private async fetchEmojiData(): Promise<EmojiGroup[]> {
    if (this._emojiDataCache) {
      return this._emojiDataCache;
    }
    this._isEmojiLoading = true;
    try {
      if (typeof fetch === 'undefined') {
        return [];
      }
      const response = await fetch('assets/emoji-data.json');
      if (!response.ok) {
        throw new Error(`Failed to load emoji data: ${response.statusText}`);
      }
      const data: EmojiDataPayload | EmojiGroup[] = await response.json();
      const groups: EmojiGroup[] = Array.isArray(data) ? data : data.groups;

      if (this._maxSupportedEmojiVersion === null) {
        this._maxSupportedEmojiVersion = detectMaxSupportedEmojiVersion(this.document);
        if (isDevMode()) {
          console.info(`Detected max supported Emoji version: E${this._maxSupportedEmojiVersion}`);
        }
      }

      this._emojiDataCache = filterSupportedEmojis(groups, this._maxSupportedEmojiVersion);
      return this._emojiDataCache;
    } finally {
      this._isEmojiLoading = false;
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

      texture.rotation = 0;
      texture.needsUpdate = true;
    }
  }

  private emitCompletion(): void {
    this.LevelTexturesLoaded.next(true);
  }
}
