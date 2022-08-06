import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, OnDestroy, ViewChild } from '@angular/core';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { delay, Subject, takeUntil } from 'rxjs';
import { Tween } from '@tweenjs/tween.js';

import { AudioType } from 'src/app/shared/services/audio/audio-info';
import { LevelDialogData } from './level-dialog-data';

import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { DialogNotifyService } from '../dialog-notify.service';
import { DialogAnimationService } from '../dialog-animation.service';

enum LevelStatisticType {
  fastMatchBonusTotal = 1,
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
  selector: 'wgl-level-dialog',
  templateUrl: './level-dialog.component.html',
  styleUrls: ['./level-dialog.component.scss'],
})
export class LevelDialogComponent implements OnDestroy, AfterViewInit {
  texturesStillLoading: boolean = true;
  progress: number = 100;

  // target values (for sequential binding)
  fastMatchBonusTotal: number = 0;
  fastestMatchTime!: string;
  moveCount: number = 0;
  moveCountEarned: number = 0;
  pieceCount: number = 0;

  private _timerQueue: LevelStat[] = [];
  timerEvent: EventEmitter<LevelStat> = new EventEmitter<LevelStat>();

  borderStyle!: string;

  @ViewChild('dialogCanvas')
  dialogCanvas!: ElementRef<HTMLCanvasElement>;

  private notifier = new Subject();

  constructor(
    private textureManager: TextureManagerService,
    private audioManager: AudioManagerService,
    private dialogNotify: DialogNotifyService,
    private dialogAnimation: DialogAnimationService,
    @Inject(MAT_DIALOG_DATA) public data: LevelDialogData
  ) {
    this.textureManager.LevelTexturesLoaded.pipe(takeUntil(this.notifier)).subscribe(() => {
      this.texturesStillLoading = false;
    });
    this.textureManager.LevelTextureLoadProgress.pipe(takeUntil(this.notifier)).subscribe((progress) => {
      this.progress = progress;
    });

    this.dialogNotify.DialogNotifyEvent.pipe(takeUntil(this.notifier)).subscribe(() => {
      const delta = { b: 1 };
      new Tween(delta)
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

    this.timerEvent
      .pipe(delay(550))
      .pipe(takeUntil(this.notifier))
      .subscribe((stat: LevelStat) => {
        switch (stat.statType) {
          case LevelStatisticType.fastMatchBonusTotal:
            this.fastMatchBonusTotal = stat.statValue;
            this.audioManager.PlayAudio(AudioType.LEVEL_STAT);
            break;

          case LevelStatisticType.fastestMatchMs:
            if (this.fastMatchBonusTotal) {
              // only show if there was a bonus involved
              const roundedTime = Math.round((stat.statValue / 1000) * 100) / 100;
              this.fastestMatchTime = `${roundedTime}s`;
              this.audioManager.PlayAudio(AudioType.LEVEL_STAT);
            }
            break;

          case LevelStatisticType.moveCount:
            this.moveCount = stat.statValue;
            this.audioManager.PlayAudio(AudioType.LEVEL_STAT);
            break;

          case LevelStatisticType.moveCountEarned:
            this.moveCountEarned = stat.statValue;
            this.audioManager.PlayAudio(AudioType.LEVEL_STAT);
            break;

          case LevelStatisticType.pieceCount:
            this.pieceCount = stat.statValue;
            this.audioManager.PlayAudio(AudioType.LEVEL_STAT);
            break;

          default:
            break;
        }

        this.processQueue();
      });

    this.setData(data);
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
    this.timerEvent.complete();
    this.timerEvent.unsubscribe();

    this.dialogAnimation.Dispose();

    this.notifier.next(undefined);
    this.notifier.complete();
  }

  private setData(levelData: LevelDialogData): void {
    // reset values
    this._timerQueue = [];
    this.fastMatchBonusTotal = 0;
    this.fastestMatchTime = '';
    this.moveCount = 0;
    this.moveCountEarned = 0;
    this.pieceCount = 0;

    if (levelData.stats.fastMatchBonusTotal) {
      this._timerQueue.push({
        statType: LevelStatisticType.fastMatchBonusTotal,
        statValue: levelData.stats.fastMatchBonusTotal,
      });
    }

    if (levelData.stats.fastestMatchTime) {
      this._timerQueue.push({
        statType: LevelStatisticType.fastestMatchMs,
        statValue: levelData.stats.fastestMatchTime,
      });
    }

    if (levelData.stats.moveCount) {
      this._timerQueue.push({
        statType: LevelStatisticType.moveCount,
        statValue: levelData.stats.moveCount,
      });
    }

    if (levelData.stats.moveCountEarned) {
      this._timerQueue.push({
        statType: LevelStatisticType.moveCountEarned,
        statValue: levelData.stats.moveCountEarned,
      });
    }

    if (levelData.stats.pieceCount) {
      this._timerQueue.push({
        statType: LevelStatisticType.pieceCount,
        statValue: levelData.stats.pieceCount,
      });
    }

    this.processQueue();
  }

  private processQueue(): void {
    if (this._timerQueue.length) {
      const nextElement = this._timerQueue.shift();
      if (nextElement) {
        this.timerEvent.next(nextElement);
      }
    }
  }
}
