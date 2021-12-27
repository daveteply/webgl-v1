import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LoadingManager, MathUtils, Texture, TextureLoader } from 'three';
import { PLAYABLE_PIECE_COUNT } from '../game-constants';
import { GamePieceMaterialData } from '../models/game-piece/game-piece-material-data';
import 'node_modules/color-scheme/lib/color-scheme.js';

declare var ColorScheme: any;

@Injectable()
export class MaterialManagerService {
  private _currentMaterials: GamePieceMaterialData[] = [];

  private _loaderManager: LoadingManager;
  private _textureLoader: TextureLoader;
  private _textures: Texture[] = [];
  private _bumpMaps: string[] = [
    'assets/maps-bump/Brick 2371 bump map.jpg',
    'assets/maps-bump/Brick 2852b bump map.jpg',
    'assets/maps-bump/Concrete 3035 bump map.jpg',
    'assets/maps-bump/Gravel 2486 bump map.jpg',
    'assets/maps-bump/Metal 2350 bump map.jpg',
    'assets/maps-bump/Metal 2860 bump map.jpg',
  ];

  private _emojiCodes: number[][] = [
    [0x1f600, 0x1f604, 0x1f609, 0x1f60a, 0x1f607, 0x1f923],
    [0x1f637, 0x1f634, 0x1f925, 0x1f970, 0x1f928, 0x1f92b],
    [0x1f917, 0x1f911, 0x1f61d, 0x1f92a, 0x1f60b, 0x1f60f],
    [0x1f975, 0x1f976, 0x1f974, 0x1f92f, 0x1f920, 0x1f978],
  ];

  constructor(@Inject(DOCUMENT) private document: Document) {
    this._loaderManager = new LoadingManager(
      this.texturesLoaded,
      this.texturesLoading,
      this.textureLoadError
    );
    this._textureLoader = new TextureLoader(this._loaderManager);
  }

  get MaterialData(): GamePieceMaterialData[] {
    return this._currentMaterials;
  }

  public InitMaterials(): void {
    // load textures
    if (!this._textures.length) {
      this._bumpMaps.forEach((b) =>
        this._textures.push(this._textureLoader.load(b))
      );
    }

    // reset array
    this._currentMaterials = [];

    // match keys are simply iterated to ensure unique key per piece
    let matchKey = 1;

    // select style for current level
    const levelStyle = MathUtils.randInt(0, 3);
    switch (levelStyle) {
      // colors
      case 0:
      // include bump maps
      case 1:
        const selectedColors = this.initColorScheme();
        let bumpTexture = undefined;
        if (levelStyle === 1) {
          bumpTexture =
            this._textures[MathUtils.randInt(0, this._textures.length - 1)];
        }
        for (let i = 0; i < PLAYABLE_PIECE_COUNT; i++) {
          this._currentMaterials.push(<GamePieceMaterialData>{
            MatchKey: matchKey++,
            BumpTexture: bumpTexture,
            Color: selectedColors[i],
          });
        }
        break;

      // default to emojis
      default:
        const dataURLs = this.initEmojiTextures();
        for (let i = 0; i < PLAYABLE_PIECE_COUNT; i++) {
          this._currentMaterials.push(<GamePieceMaterialData>{
            MatchKey: matchKey++,
            Texture: this._textureLoader.load(dataURLs[i]),
          });
        }
    }
  }

  private initColorScheme(): string[] {
    // https://github.com/c0bra/color-scheme-js
    const colorScheme = new ColorScheme();

    // get random scheme
    const schemes = ['contrast', 'triade', 'tetrade', 'analogic'];
    const scheme = schemes[MathUtils.randInt(0, schemes.length - 1)];

    // generate scheme
    colorScheme
      .from_hue(MathUtils.randInt(0, 359))
      .scheme(scheme)
      .variation('hard');
    const colors = colorScheme.colors() as [];

    return colors.map((c) => `#${c}`).slice(0, PLAYABLE_PIECE_COUNT);
  }

  private texturesLoaded(): void {
    console.log('textures loaded');
  }

  private texturesLoading(
    url: string,
    itemsLoaded: number,
    itemsTotal: number
  ): void {
    console.log('loading', url, itemsLoaded, itemsTotal);
  }

  private textureLoadError(url: string): void {
    console.error('error', url);
  }

  private initEmojiTextures(): string[] {
    const canvas = this.document.createElement('canvas');
    const scale = 100;
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

        ctx.font = 89 + 'px Arial';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(String.fromCodePoint(emojiCode), 50, 56);
        dataUrls.push(canvas.toDataURL());
      }
    }
    return dataUrls;
  }
}
