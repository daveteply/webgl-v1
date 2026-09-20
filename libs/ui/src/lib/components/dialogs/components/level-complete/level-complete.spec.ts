import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { LevelComplete } from './level-complete';
import { provideTranslocoTesting } from '@rikkle/shared';

describe('LevelComplete', () => {
  let component: LevelComplete;
  let fixture: ComponentFixture<LevelComplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelComplete],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideTranslocoTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LevelComplete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
