import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AudioManagerService } from '../../../../../shared/services/audio/audio-manager';
import { DialogAnimationService } from '../../services/dialog-animation';
import { ObjectManagerService } from '../../../../services/object-manager';
import { SaveGameService } from '../../../../services/save-game/save-game';
import { AnalyticsEventType, AnalyticsManagerService } from '../../../../../shared/services/analytics-manager';
import { HighScores } from '../../../high-scores/high-scores';
import { ProgressBar } from '../../../../../shared/components/progress-bar/progress-bar';

@Component({
  selector: 'wgl-intro',
  imports: [CommonModule, MatDialogModule, MatButtonModule, HighScores, ProgressBar],
  templateUrl: './intro.html',
  styleUrl: './intro.scss',
})
export class Intro implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dialogCanvas')
  dialogCanvas!: ElementRef<HTMLCanvasElement>;

  private objectManager = inject(ObjectManagerService);
  private audioManager = inject(AudioManagerService);
  private dialogAnimation = inject(DialogAnimationService);
  private saveGame = inject(SaveGameService);
  private analyticsManager = inject(AnalyticsManagerService);
  public dialogRef = inject(MatDialogRef<Intro>);
  private destroyRef = inject(DestroyRef);

  materialsUpdating = true;
  progress = 100;
  hasRestoreData!: boolean;

  constructor() {
    this.objectManager.LevelMaterialsUpdated.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.materialsUpdating = false;
    });

    // start-up music
    this.audioManager.PlayLevelComplete(true);
  }

  ngOnInit(): void {
    this.saveGame
      .HasSaveState()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((hasSaveData) => {
        this.hasRestoreData = hasSaveData;
      });
  }

  ngOnDestroy(): void {
    this.dialogAnimation.Dispose();
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

export { Intro as IntroDialogComponent, Intro as IntroDialog };
