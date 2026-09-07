import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovesLeft } from './moves-left';

describe('MovesLeft', () => {
  let component: MovesLeft;
  let fixture: ComponentFixture<MovesLeft>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovesLeft],
    }).compileComponents();

    fixture = TestBed.createComponent(MovesLeft);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
