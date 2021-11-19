import { Injectable } from '@angular/core';
import { Color, MeshStandardMaterial } from 'three';
import { COLOR_COUNT } from '../game-constants';
import { COLORS_256, GameMaterial } from '../models/game-material';

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
    const shuffled = COLORS_256.map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    const selectedColors = shuffled.slice(0, count);

    let matchKey = 0;

    // materials
    this._currentMaterials = [];
    selectedColors.forEach((color) => {
      this._currentMaterials.push({
        material: new MeshStandardMaterial({
          color: new Color(color.hexString),
        }),
        materialColor: color,
        matchKey: matchKey++,
      });
    });
  }
}
