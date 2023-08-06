import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { Subject, takeUntil } from 'rxjs';

import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { DialogAnimationService } from '../dialog-animation.service';
import { ObjectManagerService } from 'src/app/game/services/object-manager.service';
import { SaveGameService } from 'src/app/game/services/save-game/save-game.service';
import { AnalyticsEventType, AnalyticsManagerService } from 'src/app/shared/services/analytics-manager.service';
import { HighScoresComponent } from '../../high-scores/high-scores.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'wgl-intro-dialog',
  standalone: true,
  templateUrl: './intro-dialog.component.html',
  styleUrls: ['./intro-dialog.component.scss'],
  imports: [CommonModule, MatDialogModule, MatButtonModule, HighScoresComponent, ProgressBarComponent],
})
export class IntroDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dialogCanvas')
  dialogCanvas!: ElementRef<HTMLCanvasElement>;

  materialsUpdating = true;
  progress = 100;

  hasRestoreData!: boolean;

  private notifier = new Subject();

  constructor(
    private objectManager: ObjectManagerService,
    private audioManager: AudioManagerService,
    private dialogAnimation: DialogAnimationService,
    private saveGame: SaveGameService,
    private analyticsManager: AnalyticsManagerService,
    public dialogRef: MatDialogRef<IntroDialogComponent>
  ) {
    this.objectManager.LevelMaterialsUpdated.pipe(takeUntil(this.notifier)).subscribe(() => {
      this.materialsUpdating = false;
    });

    // start-up music
    this.audioManager.PlayLevelComplete(true);
  }

  ngOnInit(): void {
    this.saveGame
      .HasSaveState()
      .pipe(takeUntil(this.notifier))
      .subscribe((hasSaveData) => {
        this.hasRestoreData = hasSaveData;
      });
  }

  ngOnDestroy(): void {
    this.dialogAnimation.Dispose();

    this.notifier.next(undefined);
    this.notifier.complete();
  }

  ngAfterViewInit(): void {
    this.dialogAnimation.SetScene(this.dialogCanvas.nativeElement);
    this.dialogAnimation.CreateIntroDialogBoxes();
    this.dialogAnimation.Animate();
  }

  RestoreGame(): void {
    this.analyticsManager.Log(AnalyticsEventType.IntroDialogRestoreCTA);
    this.saveGame.RestoreState();
    this.dialogRef.close({ isRestoring: true });
  }
}
