import { TestBed } from '@angular/core/testing';

import { PostProcessingManager } from './post-processing-manager';

describe('PostProcessingManager', () => {
  let service: PostProcessingManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostProcessingManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
