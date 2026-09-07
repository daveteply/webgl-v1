import { TestBed } from '@angular/core/testing';
import { PerspectiveCamera, Scene } from 'three';

import { TextManagerService } from './text-manager';

describe('TextManagerService', () => {
  let service: TextManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextManagerService);
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
