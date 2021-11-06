import { Injectable } from '@angular/core';
import { Color, MeshStandardMaterial } from 'three';
import { COLORS_256, MaterialColor } from '../models/material-color';

@Injectable({
  providedIn: 'root',
})
export class MaterialManagerService {
  private _currentColors!: MaterialColor[];
  private _currentMaterials!: MeshStandardMaterial[];

  constructor() {
    this.initColorsMaterials(7);
  }

  public get Materials(): MeshStandardMaterial[] {
    return this._currentMaterials;
  }

  private initColorsMaterials(count: number): void {
    // colors
    this._currentColors = [];
    const shuffled = COLORS_256.map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    this._currentColors = shuffled.slice(0, count);

    // materials
    this._currentMaterials = [];
    this._currentColors.forEach((color) => {
      this._currentMaterials.push(
        new MeshStandardMaterial({ color: new Color(color.hexString) })
      );
    });
  }
}
