import { TestBed } from '@angular/core/testing';

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
});
