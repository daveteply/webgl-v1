import { TestBed } from '@angular/core/testing';

import { InteractionManagerService } from './interaction-manager.service';

describe('InteractionManagerService', () => {
  let service: InteractionManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteractionManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
