import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MovesRemainingInfoComponent } from './moves-remaining-info.component';

describe('MovesRemainingInfoComponent', () => {
  let component: MovesRemainingInfoComponent;
  let fixture: ComponentFixture<MovesRemainingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MovesRemainingInfoComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovesRemainingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
