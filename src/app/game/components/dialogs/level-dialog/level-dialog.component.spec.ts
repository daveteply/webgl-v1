import { DecimalPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
import { TextZoomComponent } from '../../text-zoom/text-zoom.component';

import { LevelDialogComponent } from './level-dialog.component';

describe('LevelDialogComponent', () => {
  let component: LevelDialogComponent;
  let fixture: ComponentFixture<LevelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, MatProgressBarModule],
      declarations: [LevelDialogComponent, TextZoomComponent],
      providers: [
        DecimalPipe,
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
