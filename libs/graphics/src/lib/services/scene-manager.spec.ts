import { TestBed } from '@angular/core/testing';

import { SceneManagerService } from './scene-manager';
import { provideTranslocoTesting } from '@rikkle/shared';

describe('SceneManagerService', () => {
  let service: SceneManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTranslocoTesting()],
    });
    service = TestBed.inject(SceneManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
