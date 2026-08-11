import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, DestroyRef, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AudioManagerService } from '../../../../../shared/services/audio/audio-manager';
import { DialogAnimationService } from '../../services/dialog-animation';
import { ObjectManagerService } from '../../../../services/object-manager';
import { TextureManagerService } from '../../../../services/texture/texture-manager';
import { SaveGameService } from '../../../../services/save-game/save-game';
import { AnalyticsEventType, AnalyticsManagerService } from '../../../../../shared/services/analytics-manager';
import { HighScores } from '../../../high-scores/high-scores';
import { ProgressBar } from '../../../../../shared/components/progress-bar/progress-bar';
import { APP_VERSION } from '../../../../../version';

@Component({
  selector: 'wgl-intro',
  imports: [CommonModule, MatDialogModule, MatButtonModule, HighScores, ProgressBar],
  templateUrl: './intro.html',
  styleUrl: './intro.scss',
})
export class Intro implements OnInit, OnDestroy {
  @ViewChild('dialogCanvas')
  dialogCanvas!: ElementRef<HTMLCanvasElement>;

  public appVersion = APP_VERSION;

  private objectManager = inject(ObjectManagerService);
  private textureManager = inject(TextureManagerService);
  private audioManager = inject(AudioManagerService);
  private dialogAnimation = inject(DialogAnimationService);
  private saveGame = inject(SaveGameService);
  private analyticsManager = inject(AnalyticsManagerService);
  public dialogRef = inject(MatDialogRef<Intro>);
  private destroyRef = inject(DestroyRef);

  materialsUpdating = signal<boolean>(true);
  progress = signal<number>(0);
  hasRestoreData = signal<boolean>(false);

  constructor() {
    this.textureManager.LevelTextureLoadProgress.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((progress) => {
      this.progress.set(progress);
    });

    this.objectManager.LevelMaterialsUpdated.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((updated) => {
      if (updated) {
        this.materialsUpdating.set(false);
        this.progress.set(100);
      }
    });

    // start-up music
    this.audioManager.PlayLevelComplete(true);
  }

  ngOnInit(): void {
    this.saveGame
      .HasSaveState()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((hasSaveData) => {
        this.hasRestoreData.set(hasSaveData);
      });
  }

  ngOnDestroy(): void {
    this.dialogAnimation.Dispose();
  }

  // ngAfterViewInit(): void {
  //   this.dialogAnimation.SetScene(this.dialogCanvas.nativeElement);
  //   this.dialogAnimation.CreateIntroDialogBoxes();
  //   this.dialogAnimation.Animate();
  // }

  RestoreGame(): void {
    this.analyticsManager.Log(AnalyticsEventType.IntroDialogRestoreCTA);
    this.saveGame.RestoreState();
    this.dialogRef.close({ isRestoring: true });
  }
}

export { Intro as IntroDialogComponent, Intro as IntroDialog };
