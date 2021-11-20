import { Injectable } from '@angular/core';
import { Color, MeshStandardMaterial } from 'three';
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
        }),
        materialColorHex: color,
        matchKey: matchKey++,
      });
    });
  }

  private getColorScheme(): string[] {
    const scheme = new ColorScheme();
    scheme
      .from_hue(Math.random() * 360)
      .scheme('contrast')
      .variation('hard');
    const colors = scheme.colors() as [];
    return colors.map((c) => `#${c}`).slice(0, COLOR_COUNT);
  }
}
