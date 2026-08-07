import { CommonModule, DecimalPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  ViewChild,
  DestroyRef,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { delay } from 'rxjs';
import { Tween } from '@tweenjs/tween.js';

import { AudioType } from '../../../../../shared/services/audio/audio-data';
import { TextureManagerService } from '../../../../services/texture/texture-manager';
import { AudioManagerService } from '../../../../../shared/services/audio/audio-manager';
import { DialogNotifyService } from '../../services/dialog-notify';
import { DialogAnimationService } from '../../services/dialog-animation';
import { AnalyticsEventType, AnalyticsManagerService } from '../../../../../shared/services/analytics-manager';

import { LEVEL_COMPLETE_HEADINGS } from '../../../../game-constants';
import { TextZoom } from '../../../../text/components/text-zoom/text-zoom';
import { ProgressBar } from '../../../../../shared/components/progress-bar/progress-bar';

enum LevelStatisticType {
  infoComplete = 1,
  fastMatchBonusTotal,
  fastestMatchMs,
  moveCount,
  moveCountEarned,
  pieceCount,
}

interface LevelStat {
  statType: LevelStatisticType;
  statValue: number;
}

@Component({
  selector: 'wgl-level-complete',
  providers: [DecimalPipe],
  imports: [CommonModule, MatDialogModule, MatButtonModule, TextZoom, ProgressBar],
  templateUrl: './level-complete.html',
  styleUrl: './level-complete.scss',
})
export class LevelComplete implements OnDestroy, AfterViewInit {
  texturesStillLoading = true;
  levelInfoProcessing = true;
  progress = 100;

  fastMatchBonusTotal = 0;
  fastestMatchTime!: string;
  moveCount = 0;
  moveCountEarned = 0;
  pieceCount = 0;

  private _timerQueue: LevelStat[] = [];
  private _timerEvent: EventEmitter<LevelStat> = new EventEmitter<LevelStat>();

  borderStyle!: string;

  @ViewChild('dialogCanvas')
  dialogCanvas!: ElementRef<HTMLCanvasElement>;

  private textureManager = inject(TextureManagerService);
  private audioManager = inject(AudioManagerService);
  private dialogNotify = inject(DialogNotifyService);
  private dialogAnimation = inject(DialogAnimationService);
  private analyticsManager = inject(AnalyticsManagerService);
  public dialogRef = inject(MatDialogRef<LevelComplete>);
  public data = inject(MAT_DIALOG_DATA);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  LevelHeadingPhrase!: string;

  constructor() {
    this.textureManager.LevelTexturesLoaded.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((loaded) => {
      if (loaded) {
        this.texturesStillLoading = false;
        this.progress = 100;
        this.cdr.markForCheck();
      }
    });
    this.textureManager.LevelTextureLoadProgress.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((progress) => {
      this.progress = progress;
      this.cdr.markForCheck();
    });

    this.dialogNotify.DialogNotifyEvent.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const delta = { b: 1 };
      new Tween(delta, true)
        .to({ b: 30 }, 100)
        .repeat(2)
        .yoyo(true)
        .onUpdate(() => {
          this.borderStyle = `border: ${delta.b}px dashed white`;
        })
        .onComplete(() => {
          this.borderStyle = 'border: unset';
        })
        .start();
    });

    this._timerEvent
      .pipe(delay(500))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((stat: LevelStat) => {
        switch (stat.statType) {
          case LevelStatisticType.fastMatchBonusTotal:
            this.fastMatchBonusTotal = stat.statValue;
            this.audioManager.PlayAudio(AudioType.LEVEL_STAT, true);
            break;

          case LevelStatisticType.fastestMatchMs:
            if (this.fastMatchBonusTotal) {
              const roundedTime = Math.round((stat.statValue / 1000) * 100) / 100;
              this.fastestMatchTime = `${roundedTime}s`;
              this.audioManager.PlayAudio(AudioType.LEVEL_STAT, true);
            }
            break;

          case LevelStatisticType.moveCount:
            this.moveCount = stat.statValue;
            this.audioManager.PlayAudio(AudioType.LEVEL_STAT, true);
            break;

          case LevelStatisticType.moveCountEarned:
            this.moveCountEarned = stat.statValue;
            this.audioManager.PlayAudio(AudioType.LEVEL_STAT, true);
            break;

          case LevelStatisticType.pieceCount:
            this.pieceCount = stat.statValue;
            this.audioManager.PlayAudio(AudioType.LEVEL_STAT, true);
            break;

          case LevelStatisticType.infoComplete:
            this.audioManager.PlayAudio(AudioType.LEVEL_ENABLE_CTA);
            this.levelInfoProcessing = false;
            break;
        }

        this.processQueue();
        this.cdr.markForCheck();
      });

    if (this.data) {
      this.setData(this.data);
    }

    this.LevelHeadingPhrase = LEVEL_COMPLETE_HEADINGS[Math.floor(Math.random() * LEVEL_COMPLETE_HEADINGS.length)];
  }

  NextLevel(): void {
    this.analyticsManager.Log(AnalyticsEventType.LevelDialogNextCTA);
    this.dialogRef.close();
  }

  ngAfterViewInit(): void {
    this.dialogAnimation.SetScene(this.dialogCanvas.nativeElement);
    this.dialogAnimation.CreateLevelDialogBoxes();
    this.dialogAnimation.Animate();
  }

  ngOnDestroy(): void {
    if (this._timerQueue.length) {
      this._timerQueue = [];
    }
    this._timerEvent.complete();
    this.dialogAnimation.Dispose();
  }

  private setData(levelData: any): void {
    this._timerQueue = [];
    this.fastMatchBonusTotal = 0;
    this.fastestMatchTime = '';
    this.moveCount = 0;
    this.moveCountEarned = 0;
    this.pieceCount = 0;

    this.levelInfoProcessing = true;

    if (levelData.stats?.fastMatchBonusTotal) {
      this._timerQueue.push({
        statType: LevelStatisticType.fastMatchBonusTotal,
        statValue: levelData.stats.fastMatchBonusTotal,
      });
    }

    if (levelData.stats?.fastestMatchTime) {
      this._timerQueue.push({
        statType: LevelStatisticType.fastestMatchMs,
        statValue: levelData.stats.fastestMatchTime,
      });
    }

    if (levelData.stats?.moveCount) {
      this._timerQueue.push({
        statType: LevelStatisticType.moveCount,
        statValue: levelData.stats.moveCount,
      });
    }

    if (levelData.stats?.moveCountEarned) {
      this._timerQueue.push({
        statType: LevelStatisticType.moveCountEarned,
        statValue: levelData.stats.moveCountEarned,
      });
    }

    if (levelData.stats?.pieceCount) {
      this._timerQueue.push({
        statType: LevelStatisticType.pieceCount,
        statValue: levelData.stats.pieceCount,
      });
    }

    this._timerQueue.push({ statType: LevelStatisticType.infoComplete, statValue: 0 });
    this.processQueue();
  }

  private processQueue(): void {
    if (this._timerQueue.length) {
      const nextElement = this._timerQueue.shift();
      if (nextElement) {
        this._timerEvent.next(nextElement);
      }
    }
  }
}
