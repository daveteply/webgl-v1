import { TestBed } from '@angular/core/testing';

import { SaveGame } from './save-game';

describe('SaveGame', () => {
  let service: SaveGame;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveGame);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
