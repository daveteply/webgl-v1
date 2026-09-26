import { TestBed } from '@angular/core/testing';

import { TextureManagerService } from './texture-manager';
import { LevelMaterialType } from '@rikkle/engine';
import { LevelGeometryType } from '@rikkle/engine';
import { LevelOrientationType } from '@rikkle/engine';

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

  it('should initialize Emoji textures using cached emoji data', async () => {
    const mockGroups = [
      {
        id: 'Smileys & Emotion',
        subGroup: [
          {
            id: 'face-smiling',
            codes: [
              { sequence: [128512], version: 'E1.0', desc: 'grinning face' },
              { sequence: [128515], version: 'E0.6', desc: 'grinning face with big eyes' },
            ],
          },
        ],
      },
    ];

    service.SetEmojiDataCache(mockGroups);

    let loaded = false;
    service.LevelTexturesLoaded.subscribe((isLoaded) => {
      if (isLoaded) loaded = true;
    });

    service.InitLevelTextures(2, LevelMaterialType.Emoji, LevelGeometryType.Cube);

    // Wait microtask for async loadEmojiTextures
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(loaded).toBe(true);
    expect(service.Textures.length).toBe(2);
    const textureIds = service.Textures.map((t) => t.id);
    expect(textureIds).toContain('grinning face');
    expect(textureIds).toContain('grinning face with big eyes');

    const grinningFace = service.Textures.find((t) => t.id === 'grinning face');
    expect(grinningFace).toBeDefined();
    expect(grinningFace?.texture.userData['sequence']).toEqual([128512]);
  });
});
