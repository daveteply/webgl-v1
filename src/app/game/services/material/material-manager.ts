import { Injectable, inject, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';

import { TextureManagerService } from '../texture/texture-manager';
import { StoreService } from '../../../app-store/services/store.service';

import { Color, MathUtils, MeshBasicMaterial, MeshPhongMaterial, Texture } from 'three';
import { GamePieceMaterialData } from '../../models/game-piece/game-piece-material-type';
import { PieceMaterials, PieceSideMaterial, WheelMaterial, GameMaterials } from './material-models';
import { LevelMaterialType } from '../../level-material-type';
import { GameTexture } from '../texture/game-texture';
import { PowerMoveType } from '../../models/power-move-type';
import { COLOR_SCHEMES, ColorSchemeData } from './color-schemes';
import { BUMP_SCALE } from '../../game-constants';
import arrayShuffle from '../../../shared/utils/array-shuffle';
import { PRNG } from '../../../shared/utils/prng';

@Injectable({
  providedIn: 'root',
})
export class MaterialManagerService {
  private textureManager = inject(TextureManagerService);
  private store = inject(StoreService);

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

  public UpdateMaterials(
    level: number,
    playableTextureCount: number,
    levelMaterialType: LevelMaterialType,
    rng?: PRNG,
  ): void {
    // game piece materials
    this._levelMaterials = this.getLevelMaterials(
      level,
      playableTextureCount,
      levelMaterialType,
      this.textureManager.Textures,
      rng,
    );

    // update materials
    for (const wheel of this._gameMaterials.wheelMaterials) {
      for (const piece of wheel.pieceMaterials) {
        // shuffle for each game piece
        const pieceMaterials = arrayShuffle(this._levelMaterials, rng);

        // set up each side
        for (let i = 0; i < piece.materials.length; i++) {
          this.applyMaterialToSide(piece.materials[i], pieceMaterials[i], 0);
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
      this.applyMaterialToSide(side, pieceMaterials[i], 0);
      resultMaterials.push(side);
    }

    return { materials: resultMaterials };
  }

  public ApplyPowerMoveTexture(
    pieceMaterials: PieceMaterials,
    texture: Texture,
    color?: number,
    flipDirectionUp?: boolean,
  ): void {
    for (const side of pieceMaterials.materials) {
      side.materialPhong.color.set(new Color(color || 0xffffff));
      side.materialPhong.map = texture;
      side.materialPhong.bumpMap = null;
      side.materialPhong.needsUpdate = true;
      side.useBasic = false;

      // rotation (direction up is 3, down is 1)
      if (side.materialPhong.map) {
        side.materialPhong.map.rotation = MathUtils.degToRad(flipDirectionUp ? 90 : 270);
      }
    }
  }

  public GetPowerMoveMaterials(color?: number): PieceMaterials {
    const maxMaterials = 8;
    const resultMaterials: PieceSideMaterial[] = [];

    for (let i = 0; i < maxMaterials; i++) {
      const side: PieceSideMaterial = {
        matchKey: 0,
        materialPhong: new MeshPhongMaterial({
          bumpScale: BUMP_SCALE,
          transparent: true,
          color: new Color(color || 0xffffff),
        }),
        materialBasic: new MeshBasicMaterial({ transparent: true }),
        useBasic: false,
      };
      resultMaterials.push(side);
    }

    return { materials: resultMaterials };
  }

  public ApplyMaterial(pieceMaterials: PieceMaterials, matchKey: number): void {
    const targetMaterial = this._levelMaterials.find((m) => m.matchKey === matchKey);
    for (const material of pieceMaterials.materials) {
      this.applyMaterialToSide(material, targetMaterial, 0);
    }
  }

  private applyMaterialToSide(
    targetPieceSideMaterial: PieceSideMaterial,
    sourceMaterialData: GamePieceMaterialData | undefined,
    colorDelta: number,
  ): void {
    if (targetPieceSideMaterial && sourceMaterialData) {
      // match key
      targetPieceSideMaterial.matchKey = sourceMaterialData.matchKey;

      // phong material
      targetPieceSideMaterial.materialPhong.bumpMap = sourceMaterialData.bumpTexture?.texture || null;
      targetPieceSideMaterial.materialPhong.map = sourceMaterialData.texture?.texture || null;
      targetPieceSideMaterial.materialPhong.color.set(new Color(sourceMaterialData.colorStr));
      targetPieceSideMaterial.materialPhong.needsUpdate = true;

      // basic material
      targetPieceSideMaterial.materialBasic.map = sourceMaterialData.texture?.texture || null;
      targetPieceSideMaterial.materialBasic.color.set(new Color(sourceMaterialData.colorStr));
      targetPieceSideMaterial.materialBasic.needsUpdate = true;

      targetPieceSideMaterial.useBasic = false;

      // add delta
      if (colorDelta) {
        targetPieceSideMaterial.materialPhong.color.offsetHSL(colorDelta, 0, 0);
      }
    }
  }

  private getLevelMaterials(
    level: number,
    playableTextureCount: number,
    levelMaterialType: LevelMaterialType,
    textures: GameTexture[],
    rng?: PRNG,
  ): GamePieceMaterialData[] {
    const materials: GamePieceMaterialData[] = [];

    // match keys are numbered to ensure unique key per piece
    let matchKey = 1;

    let selectedColors: string[];
    let bumpTexture: GameTexture;

    // selected style for current level
    switch (levelMaterialType) {
      // colors and symbol maps
      case LevelMaterialType.ColorBumpShape: {
        const schemeInfo = this.initColorScheme(level, playableTextureCount, rng);
        selectedColors = schemeInfo.colors;
        this.store.UpdateLevelColors(selectedColors, { name: schemeInfo.name, emoji: schemeInfo.emoji });

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
      }

      // colors and bump maps
      case LevelMaterialType.ColorBumpMaterial: {
        const schemeInfo = this.initColorScheme(level, playableTextureCount, rng);
        selectedColors = schemeInfo.colors;
        this.store.UpdateLevelColors(selectedColors, { name: schemeInfo.name, emoji: schemeInfo.emoji });

        const bumpInx = rng ? rng.nextInt(0, textures.length - 1) : MathUtils.randInt(0, textures.length - 1);
        bumpTexture = textures[bumpInx];

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
      }

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

  private initColorScheme(
    level: number,
    playableTextureCount: number,
    rng?: PRNG,
  ): { colors: string[]; name?: string; emoji?: string } {
    let selectedScheme: ColorSchemeData | undefined;
    let targetColors: string[];

    if (level === 1) {
      // Level 1 always carries the signature purple/blue glassmorphic theme (Scheme 0)
      selectedScheme = COLOR_SCHEMES[0];
      targetColors = selectedScheme.colors.slice(0, playableTextureCount);
    } else {
      // Pick a random scheme from curated schemes
      const schemeIndex = rng
        ? rng.nextInt(1, COLOR_SCHEMES.length - 1)
        : MathUtils.randInt(1, COLOR_SCHEMES.length - 1);
      selectedScheme = COLOR_SCHEMES[schemeIndex];
      targetColors = selectedScheme.colors.slice(0, playableTextureCount);
    }

    if (isDevMode()) {
      if (selectedScheme) {
        console.info(`  Color Scheme: ${selectedScheme.emoji} ${selectedScheme.name} (ID: ${selectedScheme.id})`);
      }
      console.info('    ' + targetColors.map((c) => `%c ${c}`).join(''), ...targetColors.map((c) => `color: ${c}`));
    }

    return { colors: targetColors, name: selectedScheme?.name, emoji: selectedScheme?.emoji };
  }
}

export { MaterialManagerService as MaterialManager };
