import { TestBed } from '@angular/core/testing';
import { PerspectiveCamera, Scene } from 'three';

import { TextManager } from './text-manager';

describe('TextManager', () => {
  let service: TextManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should attach text group to camera when SetCamera is called', () => {
    const scene = new Scene();
    const camera = new PerspectiveCamera();
    service.InitScene(scene);
    service.SetCamera(camera);

    expect(camera.children.length).toBe(1);
    expect(camera.children[0].name).toBe('textGroup');
  });
});
