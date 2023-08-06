import { TestBed } from '@angular/core/testing';

import { TextureManagerService } from './texture-manager.service';

describe('TextureManagerService', () => {
  let service: TextureManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TextureManagerService] });
    service = TestBed.inject(TextureManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
