import { TestBed } from '@angular/core/testing';
import { Texture } from 'three';

import { MaterialManager } from './material-manager';
import { LevelMaterialType } from '../../level-material-type';
import { GameTexture } from '../texture/game-texture';
import { PRNG } from '../../../shared/utils/prng';

describe('MaterialManager', () => {
  let service: MaterialManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create bump mapping for ColorBumpShape materials', () => {
    service.InitMaterials(2, 4);
    const mockTextures: GameTexture[] = [
      { id: 'bump1', texture: new Texture() },
      { id: 'bump2', texture: new Texture() },
      { id: 'bump3', texture: new Texture() },
    ];

    (service as unknown as { textureManager: { Textures: GameTexture[] } }).textureManager = {
      Textures: mockTextures,
    };

    service.UpdateMaterials(1, 3, LevelMaterialType.ColorBumpShape);

    expect(service.LevelMaterials.length).toBe(3);
    expect(service.LevelMaterials[0].bumpTexture).toBeDefined();
    expect(service.LevelMaterials[0].texture).toBeUndefined();
    expect(service.LevelMaterials[0].colorStr).toBeDefined();
  });

  it('should create bump mapping for ColorBumpMaterial', () => {
    service.InitMaterials(2, 4);
    const mockTextures: GameTexture[] = [{ id: 'materialBump', texture: new Texture() }];

    (service as unknown as { textureManager: { Textures: GameTexture[] } }).textureManager = {
      Textures: mockTextures,
    };

    service.UpdateMaterials(1, 3, LevelMaterialType.ColorBumpMaterial);

    expect(service.LevelMaterials.length).toBe(3);
    expect(service.LevelMaterials[0].bumpTexture).toBeDefined();
    expect(service.LevelMaterials[0].texture).toBeUndefined();
  });

  it('should create texture mapping for Emoji materials without bump textures', () => {
    service.InitMaterials(2, 4);
    const mockTextures: GameTexture[] = [
      { id: 'emoji1', texture: new Texture() },
      { id: 'emoji2', texture: new Texture() },
    ];

    (service as unknown as { textureManager: { Textures: GameTexture[] } }).textureManager = {
      Textures: mockTextures,
    };

    service.UpdateMaterials(1, 2, LevelMaterialType.Emoji);

    expect(service.LevelMaterials.length).toBe(2);
    expect(service.LevelMaterials[0].texture).toBeDefined();
    expect(service.LevelMaterials[0].bumpTexture).toBeUndefined();
  });

  it('should deterministically assign piece materials using PRNG seed', () => {
    service.InitMaterials(2, 4);
    const mockTextures: GameTexture[] = [
      { id: 'b1', texture: new Texture() },
      { id: 'b2', texture: new Texture() },
      { id: 'b3', texture: new Texture() },
      { id: 'b4', texture: new Texture() },
    ];

    (service as unknown as { textureManager: { Textures: GameTexture[] } }).textureManager = {
      Textures: mockTextures,
    };

    const rng1 = new PRNG(13579);
    service.UpdateMaterials(3, 4, LevelMaterialType.ColorBumpShape, rng1);
    const keys1 = service.GameMaterials.wheelMaterials[0].pieceMaterials.map((p) => p.materials.map((m) => m.matchKey));

    const rng2 = new PRNG(13579);
    service.UpdateMaterials(3, 4, LevelMaterialType.ColorBumpShape, rng2);
    const keys2 = service.GameMaterials.wheelMaterials[0].pieceMaterials.map((p) => p.materials.map((m) => m.matchKey));

    expect(keys1).toEqual(keys2);
  });
});
