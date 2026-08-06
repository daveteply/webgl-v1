import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovesRemaining } from './moves-remaining';

describe('MovesRemaining', () => {
  let component: MovesRemaining;
  let fixture: ComponentFixture<MovesRemaining>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovesRemaining],
    }).compileComponents();

    fixture = TestBed.createComponent(MovesRemaining);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
