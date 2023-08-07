import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovesLeftComponent } from './moves-left.component';

describe('MovesLeftComponent', () => {
  let component: MovesLeftComponent;
  let fixture: ComponentFixture<MovesLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovesLeftComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovesLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
