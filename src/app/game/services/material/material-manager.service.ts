import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs';
import { Color, MathUtils, MeshBasicMaterial, MeshPhongMaterial, Texture } from 'three';
import * as shuffleArray from 'shuffle-array';

import { TextureManagerService } from '../texture/texture-manager.service';
import { StoreService } from 'src/app/app-store/services/store.service';

import { GameMaterials, PieceMaterials, PieceSideMaterial, WheelMaterial } from './material-models';
import { GamePieceMaterialData } from '../../models/game-piece/game-piece-material-data';
import { LevelMaterialType } from '../../level-material-type';
import { ColorSchemeData, COLOR_SCHEME_DATA } from './color-info';
import { PowerMoveType } from '../../models/power-move-type';
import { DEFAULT_PLAYABLE_TEXTURE_COUNT } from '../../game-constants';
import { SaveGameService } from '../save-game/save-game.service';

@Injectable()
export class MaterialManagerService {
  private _gameMaterials!: GameMaterials;
  get GameMaterials(): GameMaterials {
    return this._gameMaterials;
  }

  private _levelMaterials!: GamePieceMaterialData[];
  get LevelMaterials(): GamePieceMaterialData[] {
    return this._levelMaterials;
  }

  constructor(
    private textureManager: TextureManagerService,
    private store: StoreService,
    private saveGame: SaveGameService
  ) {}

  public InitMaterials(wheelCount: number, pieceCount: number): void {
    this._gameMaterials = {
      wheelMaterials: new Array<WheelMaterial>(wheelCount),
    };

    for (let wheelInx = 0; wheelInx < wheelCount; wheelInx++) {
      // allocate piece material for next wheel
      this._gameMaterials.wheelMaterials[wheelInx] = { pieceMaterials: new Array<PieceMaterials>(pieceCount) };
      for (let pieceInx = 0; pieceInx < pieceCount; pieceInx++) {
        // allocate materials for each piece side
        this._gameMaterials.wheelMaterials[wheelInx].pieceMaterials[pieceInx] = {
          materials: new Array<PieceSideMaterial>(DEFAULT_PLAYABLE_TEXTURE_COUNT),
        };
        for (let textureInx = 0; textureInx < DEFAULT_PLAYABLE_TEXTURE_COUNT; textureInx++) {
          this._gameMaterials.wheelMaterials[wheelInx].pieceMaterials[pieceInx].materials[textureInx] = {
            matchKey: 0,
            materialPhong: new MeshPhongMaterial({ bumpScale: 0.03, transparent: true }),
            materialBasic: new MeshBasicMaterial({ transparent: true }),
            useBasic: false,
          };
        }
      }
    }
  }

  public UpdateMaterials(level: number, playableTextureCount: number, levelMaterialType: LevelMaterialType): void {
    // game piece materials
    this._levelMaterials = this.getLevelMaterials(
      level,
      playableTextureCount,
      levelMaterialType,
      this.textureManager.Textures
    );

    if (this.saveGame.IsRestoring) {
      this.RestoreMaterials();
    } else {
      // update materials
      for (const wheel of this._gameMaterials.wheelMaterials) {
        for (const piece of wheel.pieceMaterials) {
          // shuffle for each game piece
          const pieceMaterials = this.saveGame.IsRestoring ? this._levelMaterials : shuffleArray(this._levelMaterials);

          // set up each side
          for (let i = 0; i < piece.materials.length; i++) {
            const side = piece.materials[i];
            const material = pieceMaterials[i];

            // match key
            side.matchKey = material?.matchKey;

            // bump symbols and textures
            if (material.bumpTexture && material.colorStr) {
              side.materialPhong.color = material.color as Color;
              side.materialPhong.bumpMap = material.bumpTexture;
              side.materialPhong.opacity = 0;
              side.useBasic = false;
            }

            // emojis
            if (material.texture && !material.colorStr) {
              side.materialBasic.map = material.texture;
              side.materialBasic.opacity = 0;
              side.useBasic = true;
            }
          }
        }
      }
    }
  }

  public RestoreMaterials(): void {
    const restoredMaterials = this.saveGame.SavedGameData.gameMaterials;

    for (let wheelInx = 0; wheelInx < this._gameMaterials.wheelMaterials.length; wheelInx++) {
      const wheel = this._gameMaterials.wheelMaterials[wheelInx];
      if (restoredMaterials) {
        const restoreWheel = restoredMaterials[wheelInx];

        for (let pieceInx = 0; pieceInx < wheel.pieceMaterials.length; pieceInx++) {
          const piece = wheel.pieceMaterials[pieceInx];
          const restorePiece = restoreWheel[pieceInx];

          for (let sideInx = 0; sideInx < piece.materials.length; sideInx++) {
            // matchKey for side
            const restoreMatchKey = restorePiece[sideInx];

            // fetch matching material
            const restoreMaterial = this._levelMaterials.find((m) => m.matchKey === restoreMatchKey);

            // set restored material properties
            const side = piece.materials[sideInx];
            side.matchKey = restoreMatchKey;

            // bump symbols and textures
            if (restoreMaterial?.bumpTexture && restoreMaterial.colorStr) {
              side.materialPhong.color = restoreMaterial.color as Color;
              side.materialPhong.bumpMap = restoreMaterial.bumpTexture;
              side.materialPhong.opacity = 0;
              side.useBasic = false;
            }

            // emojis
            if (restoreMaterial?.texture && !restoreMaterial.colorStr) {
              side.materialBasic.map = restoreMaterial.texture;
              side.materialBasic.opacity = 0;
              side.useBasic = true;
            }
          }
        }
      }
    }
  }

  public GetPowerMovePieceTexture(moveType: PowerMoveType): Observable<Texture> {
    return this.textureManager.GetPowerMoveTexture(moveType);
  }

  private getLevelMaterials(
    level: number,
    playableTextureCount: number,
    levelMaterialType: LevelMaterialType,
    textures: Texture[]
  ): GamePieceMaterialData[] {
    const materials: GamePieceMaterialData[] = [];

    // match keys are numbered to ensure unique key per piece
    let matchKey = 1;

    let selectedColors: string[] = [];

    // selected style for current level
    switch (levelMaterialType) {
      // colors and symbol maps
      case LevelMaterialType.ColorBumpShape:
        selectedColors = this.initColorScheme(level, playableTextureCount);
        this.store.UpdateLevelColors(selectedColors);

        selectedColors.forEach((c, inx) => {
          const color = new Color(c);
          materials.push({
            matchKey: matchKey++,
            bumpTexture: textures[inx],
            texture: undefined,
            colorStr: c,
            color,
          });
        });
        break;

      // colors and bump maps
      case LevelMaterialType.ColorBumpMaterial:
        selectedColors = this.initColorScheme(level, playableTextureCount);
        this.store.UpdateLevelColors(selectedColors);

        const bumpTexture = textures[MathUtils.randInt(0, textures.length - 1)];

        selectedColors.forEach((c) => {
          materials.push({
            matchKey: matchKey++,
            bumpTexture: bumpTexture as Texture,
            texture: undefined,
            colorStr: c,
            color: new Color(c),
          });
        });
        break;

      // emojis
      case LevelMaterialType.Emoji:
        for (let i = 0; i < playableTextureCount; i++) {
          materials.push({
            matchKey: matchKey++,
            texture: textures[i],
            bumpTexture: undefined,
          });
        }
        break;
    }

    return materials;
  }

  private initColorScheme(level: number, playableTextureCount: number): string[] {
    let scheme: ColorSchemeData;
    if (level === 1) {
      scheme = COLOR_SCHEME_DATA.find((c) => c.id === 2) || COLOR_SCHEME_DATA[0];
    } else {
      scheme = COLOR_SCHEME_DATA[MathUtils.randInt(0, COLOR_SCHEME_DATA.length - 1)];
    }

    const sortedColors = scheme.colors.sort();

    if (!environment.production) {
      console.info('  color scheme:', scheme.id);
      sortedColors.sort().forEach((c) => console.info(`    %c ${c}`, `color: ${c}`));
    }

    const shuffledColors = shuffleArray(sortedColors).slice(0, playableTextureCount);

    if (!environment.production) {
      console.info('    game piece colors:', scheme);
      shuffledColors.forEach((c) => console.info(`      %c ${c}`, `color: ${c}`));
    }

    let targetColors = level === 1 ? sortedColors.slice(-playableTextureCount) : shuffledColors;
    if (this.saveGame.IsRestoring) {
      targetColors = this.saveGame.SavedGameData.textureData.map((t) => t.colorStr) as string[];
    }

    return targetColors;
  }
}
