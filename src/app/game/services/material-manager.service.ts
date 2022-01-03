import { Injectable } from '@angular/core';
import { MathUtils, Texture } from 'three';
import { PLAYABLE_PIECE_COUNT } from '../game-constants';
import { GamePieceMaterialData } from '../models/game-piece/game-piece-material-data';
import { TextureManagerService } from './texture-manager.service';
import 'node_modules/color-scheme/lib/color-scheme.js';

declare var ColorScheme: any;

@Injectable()
export class MaterialManagerService {
  private _currentMaterials: GamePieceMaterialData[] = [];

  constructor(private textureManager: TextureManagerService) {}

  get MaterialData(): GamePieceMaterialData[] {
    return this._currentMaterials;
  }

  public InitMaterials(): void {
    // reset array
    this._currentMaterials = [];

    // match keys are simply iterated to ensure unique key per piece
    let matchKey = 1;

    // select style for current level
    let selectedColors: string[] = [];
    switch (this.textureManager.LevelType) {
      // colors
      case 1:
        selectedColors = this.initColorScheme();
        selectedColors.forEach((color) => {
          this._currentMaterials.push(<GamePieceMaterialData>{
            MatchKey: matchKey++,
            Color: color,
          });
        });
        break;

      // include bump maps
      case 2:
        selectedColors = this.initColorScheme();
        // pick a random texture
        const bumpTexture =
          this.textureManager.Textures[
            MathUtils.randInt(0, this.textureManager.Textures.length - 1)
          ];

        selectedColors.forEach((color) => {
          this._currentMaterials.push(<GamePieceMaterialData>{
            MatchKey: matchKey++,
            BumpTexture: bumpTexture as Texture,
            Color: color,
          });
        });

        break;

      // default to emojis
      default:
        for (let i = 0; i < PLAYABLE_PIECE_COUNT; i++) {
          this._currentMaterials.push(<GamePieceMaterialData>{
            MatchKey: matchKey++,
            Texture: this.textureManager.Textures[i],
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
}
