import { TestBed } from '@angular/core/testing';

import { TextureManager } from './texture-manager';

describe('TextureManager', () => {
  let service: TextureManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextureManager);
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
});
