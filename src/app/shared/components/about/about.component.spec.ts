import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [AboutComponent],
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
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
