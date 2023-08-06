import { TestBed } from '@angular/core/testing';

import { TextManagerService } from './text-manager.service';

describe('TextManagerService', () => {
  let service: TextManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
