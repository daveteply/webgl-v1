import { TestBed } from '@angular/core/testing';

import { DialogAnimationService } from './dialog-animation.service';

describe('DialogAnimationService', () => {
  let service: DialogAnimationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogAnimationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
