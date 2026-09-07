import { TestBed } from '@angular/core/testing';

import { PostProcessingManagerService } from './post-processing-manager';

describe('PostProcessingManagerService', () => {
  let service: PostProcessingManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostProcessingManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
