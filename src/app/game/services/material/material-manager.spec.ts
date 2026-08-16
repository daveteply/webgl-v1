import { TestBed } from '@angular/core/testing';
import { Texture } from 'three';

import { MaterialManager } from './material-manager';
import { LevelMaterialType } from '../../level-material-type';
import { GameTexture } from '../texture/game-texture';

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

    // inject mock textures via private property or update
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
});
