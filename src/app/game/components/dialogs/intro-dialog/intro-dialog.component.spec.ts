import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EffectsManagerService } from 'src/app/game/services/effects-manager.service';
import { GameEngineService } from 'src/app/game/services/game-engine.service';
import { MaterialManagerService } from 'src/app/game/services/material/material-manager.service';
import { ObjectManagerService } from 'src/app/game/services/object-manager.service';
import { ScoringManagerService } from 'src/app/game/services/scoring-manager.service';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';

import { IntroDialogComponent } from './intro-dialog.component';

describe('IntroDialogComponent', () => {
  let component: IntroDialogComponent;
  let fixture: ComponentFixture<IntroDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, IntroDialogComponent],
      providers: [
        ObjectManagerService,
        MaterialManagerService,
        TextureManagerService,
        EffectsManagerService,
        ScoringManagerService,
        GameEngineService,
        {
          provide: MatDialogRef,
          useValue: {},
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
