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

import { GameOverComponent } from './game-over.component';

describe('GameOverComponent', () => {
  let component: GameOverComponent;
  let fixture: ComponentFixture<GameOverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, MatProgressBarModule],
      declarations: [GameOverComponent],
      providers: [
        TextureManagerService,
        ObjectManagerService,
        MaterialManagerService,
        EffectsManagerService,
        ScoringManagerService,
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameOverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
