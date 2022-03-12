import { Injectable } from '@angular/core';
import { MathUtils, Texture } from 'three';
import * as shuffleArray from 'shuffle-array';
import { environment } from 'src/environments/environment';
import { PLAYABLE_PIECE_COUNT } from '../../game-constants';
import { GamePieceMaterialData } from '../../models/game-piece/game-piece-material-data';
import { LevelMaterialType } from '../../models/level-material-type';
import { TextureManagerService } from '../texture/texture-manager.service';
import { ColorSchemeData } from './color-info';

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

        const bumpTexture = this.textureManager.Textures[MathUtils.randInt(0, this.textureManager.Textures.length - 1)];

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
    const scheme = ColorSchemeData[MathUtils.randInt(0, ColorSchemeData.length - 1)];
    const sortedColors = scheme.colors.sort();

    if (!environment.production) {
      console.info('  color scheme:', scheme.id);
      sortedColors.sort().forEach((c) => console.info(`    %c ${c}`, `color: ${c}`));
    }

    const shuffledColors = shuffleArray(sortedColors).slice(0, PLAYABLE_PIECE_COUNT);

    if (!environment.production) {
      console.info('    game piece colors:', scheme);
      shuffledColors.forEach((c) => console.info(`      %c ${c}`, `color: ${c}`));
    }

    return shuffledColors;
  }
}
