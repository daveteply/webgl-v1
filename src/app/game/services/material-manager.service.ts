import { Injectable } from '@angular/core';
import { MathUtils, Texture } from 'three';
import { PLAYABLE_PIECE_COUNT } from '../game-constants';
import { GamePieceMaterialData } from '../models/game-piece/game-piece-material-data';
import { TextureManagerService } from './texture/texture-manager.service';
import { LevelMaterialType } from '../models/level-material-type';
import 'node_modules/color-scheme/lib/color-scheme.js';
import * as shuffleArray from 'shuffle-array';
import { environment } from 'src/environments/environment';

declare var ColorScheme: any;

@Injectable()
export class MaterialManagerService {
  constructor(private textureManager: TextureManagerService) {}

  public InitMaterials(): GamePieceMaterialData[] {
    // reset array
    const materials: GamePieceMaterialData[] = [];

    // match keys are numbered to ensure unique key per piece
    let matchKey = 1;

    let selectedColors: string[] = [];

    // selected style for current level
    switch (this.textureManager.LevelType) {
      // colors and symbol maps
      case LevelMaterialType.ColorBumpShape:
        selectedColors = this.initColorScheme();

        selectedColors.forEach((color, inx) => {
          materials.push({
            MatchKey: matchKey++,
            BumpTexture: this.textureManager.Textures[inx],
            Color: color,
          });
        });
        break;

      // colors and bump maps
      case LevelMaterialType.ColorBumpMaterial:
        selectedColors = this.initColorScheme();

        const bumpTexture =
          this.textureManager.Textures[
            MathUtils.randInt(0, this.textureManager.Textures.length - 1)
          ];

        selectedColors.forEach((color) => {
          materials.push({
            MatchKey: matchKey++,
            BumpTexture: bumpTexture as Texture,
            Color: color,
          });
        });
        break;

      // emojis
      case LevelMaterialType.Emoji:
        for (let i = 0; i < PLAYABLE_PIECE_COUNT; i++) {
          materials.push({
            MatchKey: matchKey++,
            Texture: this.textureManager.Textures[i],
          });
        }
        break;
    }

    return materials;
  }

  private initColorScheme(): string[] {
    // https://github.com/c0bra/color-scheme-js
    const colorScheme = new ColorScheme();

    // get random scheme
    const schemes = ['contrast', 'triade', 'tetrade'];
    const scheme = schemes[MathUtils.randInt(0, schemes.length - 1)];

    // generate scheme
    colorScheme
      .from_hue(MathUtils.randInt(0, 359))
      .scheme(scheme)
      .variation('hard');
    const colors = colorScheme.colors() as [];

    if (!environment.production) {
      console.info('  color scheme:', scheme);
      colors.sort().forEach((c) => console.info(`    %c ${c}`, `color: #${c}`));
    }

    const shuffledColors = shuffleArray(colors)
      .map((c) => `#${c}`)
      .slice(0, PLAYABLE_PIECE_COUNT);

    if (!environment.production) {
      console.info('    game piece colors:', scheme);
      shuffledColors.forEach((c) =>
        console.info(`      %c ${c}`, `color: ${c}`)
      );
    }

    return shuffledColors;
  }
}
