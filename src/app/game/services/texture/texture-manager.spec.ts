import { TestBed } from '@angular/core/testing';

import { TextureManagerService } from './texture-manager';
import { LevelMaterialType } from '../../models/level-material-type';
import { LevelGeometryType } from '../../models/level-geometry-type';
import { LevelOrientationType } from '../../models/level-orientation-type';

describe('TextureManagerService', () => {
  let service: TextureManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextureManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit texture load progress via Subject stream', () => {
    let progressVal = 0;
    service.LevelTextureLoadProgress.subscribe((p) => {
      progressVal = p;
    });

    service.LevelTextureLoadProgress.next(50);
    expect(progressVal).toBe(50);
  });

  it('should initialize textures with horizontal orientation and emit loading started', () => {
    let started = false;
    service.LevelTextureLoadingStarted.subscribe(() => {
      started = true;
    });

    service.InitLevelTextures(
      3,
      LevelMaterialType.Color,
      LevelGeometryType.Cube,
      undefined,
      LevelOrientationType.HorizontalRight,
    );

    expect(started).toBe(true);
    expect(service['_levelOrientationType']).toBe(LevelOrientationType.HorizontalRight);
  });
});
