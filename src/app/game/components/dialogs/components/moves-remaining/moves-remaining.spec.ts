import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MovesRemaining } from './moves-remaining';

describe('MovesRemaining', () => {
  let component: MovesRemaining;
  let fixture: ComponentFixture<MovesRemaining>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovesRemaining],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovesRemaining);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
