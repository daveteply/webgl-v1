import { TestBed } from '@angular/core/testing';

import { ObjectManager } from './object-manager';

describe('ObjectManager', () => {
  let service: ObjectManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
