import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { GameOver } from './game-over';

describe('GameOver', () => {
  let component: GameOver;
  let fixture: ComponentFixture<GameOver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameOver],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameOver);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
