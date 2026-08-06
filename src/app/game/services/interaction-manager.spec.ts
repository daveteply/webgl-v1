import { TestBed } from '@angular/core/testing';

import { InteractionManager } from './interaction-manager';

describe('InteractionManager', () => {
  let service: InteractionManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteractionManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
