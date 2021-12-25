import { Injectable } from '@angular/core';
import {
  Color,
  LoadingManager,
  MathUtils,
  MeshPhongMaterial,
  TextureLoader,
} from 'three';
import { COLOR_COUNT } from '../game-constants';
import { GameMaterial } from '../models/game-material';
import 'node_modules/color-scheme/lib/color-scheme.js';

declare var ColorScheme: any;

@Injectable()
export class MaterialManagerService {
  private _currentMaterials: GameMaterial[] = [];

  private _loaderManager: LoadingManager;
  private _textureLoader: TextureLoader;

  private _bumpMaps: string[] = [
    'assets/maps-bump/Brick 2371 bump map.jpg',
    'assets/maps-bump/Brick 2852b bump map.jpg',
    'assets/maps-bump/Concrete 3035 bump map.jpg',
    'assets/maps-bump/Gravel 2486 bump map.jpg',
    'assets/maps-bump/Metal 2350 bump map.jpg',
    'assets/maps-bump/Metal 2860 bump map.jpg',
  ];

  constructor() {
    this._loaderManager = new LoadingManager(
      this.texturesLoaded,
      this.texturesLoading,
      this.textureLoadError
    );
    this._textureLoader = new TextureLoader(this._loaderManager);
  }

  get Materials(): GameMaterial[] {
    return this._currentMaterials;
  }

  public InitColorsMaterials(): void {
    // colors
    const selectedColors = this.getColorScheme();

    let matchKey = 0;

    // clean up existing materials
    if (this._currentMaterials.length) {
      this._currentMaterials.forEach((m) => m.material.dispose());
      this._currentMaterials = [];
    }

    // create materials
    selectedColors.forEach((color, inx) => {
      this._currentMaterials.push({
        material: new MeshPhongMaterial({
          color: new Color(color),
          bumpMap: this._textureLoader.load(this._bumpMaps[inx]),
          bumpScale: 0.03,
          transparent: true,
        }),
        materialColorHex: color,
        matchKey: matchKey++,
      });
    });
  }

  private getColorScheme(): string[] {
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

    return colors.map((c) => `#${c}`).slice(0, COLOR_COUNT);
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
    console.log('error', url);
  }
}
