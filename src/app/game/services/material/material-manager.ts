import { Injectable, inject, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';
import { Color, MathUtils, MeshBasicMaterial, MeshPhongMaterial, Texture } from 'three';
import arrayShuffle from '../../../shared/utils/array-shuffle';

import { TextureManagerService } from '../texture/texture-manager';
import { StoreService } from '../../../app-store/services/store.service';
import { SaveGameService } from '../save-game/save-game';

import { GameMaterials, PieceMaterials, PieceSideMaterial, WheelMaterial } from './material-models';
import { GamePieceMaterialData } from '../../models/game-piece/game-piece-material-type';
import { LevelMaterialType } from '../../level-material-type';
import { ColorSchemeData, COLOR_SCHEME_DATA } from './color-info';
import { PowerMoveType } from '../../models/power-move-type';
import { GameTexture } from '../texture/game-texture';
import { BUMP_DEPTH as BUMP_SCALE } from '../../game-constants';

@Injectable({
  providedIn: 'root',
})
export class MaterialManagerService {
  private textureManager = inject(TextureManagerService);
  private store = inject(StoreService);
  private saveGame = inject(SaveGameService);

  private _gameMaterials!: GameMaterials;
  get GameMaterials(): GameMaterials {
    return this._gameMaterials;
  }

  private _levelMaterials!: GamePieceMaterialData[];
  get LevelMaterials(): GamePieceMaterialData[] {
    return this._levelMaterials;
  }

  public InitMaterials(wheelCount: number, pieceCount: number): void {
    this.DisposeMaterials();

    this._gameMaterials = {
      wheelMaterials: new Array<WheelMaterial>(wheelCount),
    };

    const maxMaterials = 8;
    for (let wheelInx = 0; wheelInx < wheelCount; wheelInx++) {
      // allocate piece material for next wheel
      this._gameMaterials.wheelMaterials[wheelInx] = { pieceMaterials: new Array<PieceMaterials>(pieceCount) };
      for (let pieceInx = 0; pieceInx < pieceCount; pieceInx++) {
        // allocate materials for each piece side
        this._gameMaterials.wheelMaterials[wheelInx].pieceMaterials[pieceInx] = {
          materials: new Array<PieceSideMaterial>(maxMaterials),
        };
        for (let textureInx = 0; textureInx < maxMaterials; textureInx++) {
          this._gameMaterials.wheelMaterials[wheelInx].pieceMaterials[pieceInx].materials[textureInx] = {
            matchKey: 0,
            materialPhong: new MeshPhongMaterial({ bumpScale: BUMP_SCALE, transparent: true }),
            materialBasic: new MeshBasicMaterial({ transparent: true }),
            useBasic: false,
          };
        }
      }
    }
  }

  public DisposeMaterials(): void {
    if (!this._gameMaterials?.wheelMaterials) return;
    for (const wheel of this._gameMaterials.wheelMaterials) {
      for (const piece of wheel.pieceMaterials) {
        for (const side of piece.materials) {
          side.materialPhong?.dispose();
          side.materialBasic?.dispose();
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
      this.textureManager.Textures,
    );

    if (this.saveGame.IsRestoring) {
      this.RestoreMaterials();
    } else {
      // update materials
      for (const wheel of this._gameMaterials.wheelMaterials) {
        for (const piece of wheel.pieceMaterials) {
          // shuffle for each game piece
          const pieceMaterials = this.saveGame.IsRestoring ? this._levelMaterials : arrayShuffle(this._levelMaterials);

          // set up each side
          for (let i = 0; i < piece.materials.length; i++) {
            this.applyMaterialToSide(piece.materials[i], pieceMaterials[i], 0);
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
            const restoreMatchKey = restorePiece[sideInx];
            const restoreMaterial = this._levelMaterials.find((m) => m.matchKey === restoreMatchKey);
            this.applyMaterialToSide(piece.materials[sideInx], restoreMaterial, 0);
          }
        }
      }
    }
  }

  public GetPowerMovePieceTexture(moveType: PowerMoveType): Observable<Texture> {
    return this.textureManager.GetPowerMoveTexture(moveType);
  }

  public GetRandomPieceMaterial(): PieceMaterials {
    const pieceMaterials = arrayShuffle(this._levelMaterials);
    const maxMaterials = 8;
    const resultMaterials: PieceSideMaterial[] = [];

    for (let i = 0; i < maxMaterials; i++) {
      const side: PieceSideMaterial = {
        matchKey: 0,
        materialPhong: new MeshPhongMaterial({ bumpScale: BUMP_SCALE, transparent: true }),
        materialBasic: new MeshBasicMaterial({ transparent: true }),
        useBasic: false,
      };
      this.applyMaterialToSide(side, pieceMaterials[i], 1.0);
      resultMaterials.push(side);
    }
    return { materials: resultMaterials };
  }

  private applyMaterialToSide(side: PieceSideMaterial, material: GamePieceMaterialData | undefined, opacity = 0): void {
    if (!material) return;

    side.matchKey = material.matchKey;

    // bump symbols and textures
    if (material.bumpTexture && material.colorStr) {
      side.materialPhong.color.setHex(material.color?.getHex() || 0x0);
      side.materialPhong.specular.setHex(0x333333);
      side.materialPhong.shininess = 15;
      side.materialPhong.bumpMap = material.bumpTexture.texture;
      side.materialPhong.bumpScale = BUMP_SCALE;
      side.materialPhong.needsUpdate = true;
      side.materialPhong.opacity = opacity;
      side.useBasic = false;
    }

    // emojis
    if (material.texture && !material.colorStr) {
      side.materialBasic.map = material.texture.texture;
      side.materialBasic.needsUpdate = true;
      side.materialBasic.opacity = opacity;
      side.useBasic = true;
    }
  }

  private getLevelMaterials(
    level: number,
    playableTextureCount: number,
    levelMaterialType: LevelMaterialType,
    textures: GameTexture[],
  ): GamePieceMaterialData[] {
    const materials: GamePieceMaterialData[] = [];

    // match keys are numbered to ensure unique key per piece
    let matchKey = 1;

    let selectedColors: string[] = [];
    let bumpTexture: GameTexture;

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

        bumpTexture = textures[MathUtils.randInt(0, textures.length - 1)];

        selectedColors.forEach((c: string) => {
          materials.push({
            matchKey: matchKey++,
            bumpTexture: bumpTexture,
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

    if (isDevMode()) {
      console.info('  Color Scheme:', scheme.id);
      console.info('    ' + sortedColors.map((c) => `%c ${c}`).join(''), ...sortedColors.map((c) => `color: ${c}`));
    }

    const shuffledColors = arrayShuffle(sortedColors).slice(0, playableTextureCount);

    if (isDevMode()) {
      console.info('    Game Piece Colors:', scheme);
      console.info('    ' + shuffledColors.map((c) => `%c ${c}`).join(''), ...shuffledColors.map((c) => `color: ${c}`));
    }

    let targetColors = level === 1 ? sortedColors.slice(-playableTextureCount) : shuffledColors;
    if (this.saveGame.IsRestoring) {
      targetColors = this.saveGame.SavedGameData.textureData.map((t) => t.colorStr) as string[];
    }

    return targetColors;
  }
}

export { MaterialManagerService as MaterialManager };
