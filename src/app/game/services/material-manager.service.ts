import { Injectable } from '@angular/core';
import { Color, MathUtils, MeshStandardMaterial } from 'three';
import { COLOR_COUNT } from '../game-constants';
import { GameMaterial } from '../models/game-material';
import 'node_modules/color-scheme/lib/color-scheme.js';

declare var ColorScheme: any;

@Injectable({
  providedIn: 'root',
})
export class MaterialManagerService {
  private _currentMaterials: GameMaterial[] = [];

  constructor() {
    this.initColorsMaterials(COLOR_COUNT);
  }

  public get Materials(): GameMaterial[] {
    return this._currentMaterials;
  }

  private initColorsMaterials(count: number): void {
    // colors
    const selectedColors = this.getColorScheme();

    let matchKey = 0;

    // materials
    this._currentMaterials = [];
    selectedColors.forEach((color) => {
      this._currentMaterials.push({
        material: new MeshStandardMaterial({
          color: new Color(color),
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
      .from_hue(MathUtils.randInt(126, 360))
      .scheme(scheme)
      .variation('hard');
    const colors = colorScheme.colors() as [];

    return colors.map((c) => `#${c}`).slice(0, COLOR_COUNT);
  }
}