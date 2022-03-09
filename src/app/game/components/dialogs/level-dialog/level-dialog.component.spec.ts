import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EffectsManagerService } from 'src/app/game/services/effects-manager.service';
import { MaterialManagerService } from 'src/app/game/services/material/material-manager.service';
import { ObjectManagerService } from 'src/app/game/services/object-manager.service';
import { ScoringManagerService } from 'src/app/game/services/scoring-manager.service';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';

import { LevelDialogComponent } from './level-dialog.component';

describe('LevelDialogComponent', () => {
  let component: LevelDialogComponent;
  let fixture: ComponentFixture<LevelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, MatProgressBarModule],
      declarations: [LevelDialogComponent],
      providers: [
        TextureManagerService,
        ObjectManagerService,
        MaterialManagerService,
        EffectsManagerService,
        ScoringManagerService,
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
