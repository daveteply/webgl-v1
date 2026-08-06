import { TestBed } from '@angular/core/testing';

import { SceneManager } from './scene-manager';

describe('SceneManager', () => {
  let service: SceneManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SceneManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
