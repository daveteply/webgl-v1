import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TextureManagerService } from 'src/app/game/services/texture-manager.service';

import { LevelDialogComponent } from './level-dialog.component';

describe('LevelDialogComponent', () => {
  let component: LevelDialogComponent;
  let fixture: ComponentFixture<LevelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LevelDialogComponent],
      providers: [
        TextureManagerService,
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            stats: {
              fastestMatchMs: 1,
              moveCount: 1,
              pieceCount: 1,
            },
          },
        },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
