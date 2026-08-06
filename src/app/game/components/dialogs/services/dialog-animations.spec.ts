import { TestBed } from '@angular/core/testing';

import { DialogAnimations } from './dialog-animations';

describe('DialogAnimations', () => {
  let service: DialogAnimations;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogAnimations);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
