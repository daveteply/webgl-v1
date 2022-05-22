import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';

import { GameOverDialogComponent } from './game-over-dialog.component';

describe('GameOverDialogComponent', () => {
  let component: GameOverDialogComponent;
  let fixture: ComponentFixture<GameOverDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameOverDialogComponent],
      providers: [
        TextureManagerService,
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameOverDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
