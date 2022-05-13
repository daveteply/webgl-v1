import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, OnDestroy, ViewChild } from '@angular/core';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { delay } from 'rxjs';
import { MathUtils } from 'three';
import { Tween } from '@tweenjs/tween.js';

import { EmojiInfo } from 'src/app/app-store/models/emoji-info';
import { GAME_TITLE, MINIMUM_MATCH_COUNT } from 'src/app/game/game-constants';
import { AudioType } from 'src/app/shared/services/audio/audio-info';
import { LevelDialogData } from './level-dialog-data';

import { StoreService } from 'src/app/app-store/services/store.service';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { DialogNotifyService } from '../dialog-notify.service';

enum LevelElementType {
  fastMatchBonusTotal = 1,
  fastestMatchMs,
  moveCount,
  moveCountEarned,
  pieceCount,
}

interface LevelStat {
  statType: LevelElementType;
  statValue: number;
}

interface boxParticle {
  x: number;
  y: number;
  size: number;
  velocity: number;
  limit: number;
  color?: string;
  emoji?: string;
}

@Component({
  selector: 'wgl-level-dialog',
  templateUrl: './level-dialog.component.html',
  styleUrls: ['./level-dialog.component.scss'],
})
export class LevelDialogComponent implements OnDestroy, AfterViewInit {
  matchTarget = MINIMUM_MATCH_COUNT;
  texturesStillLoading: boolean = true;
  progress: number = 100;

  // target values (for sequential binding)
  fastMatchBonusTotal: number = 0;
  fastestMatchMs: number = 0;
  moveCount: number = 0;
  moveCountEarned: number = 0;
  pieceCount: number = 0;

  private _animateRequestId!: number;

  private _timerQueue: LevelStat[] = [];
  timerEvent: EventEmitter<LevelStat> = new EventEmitter<LevelStat>();

  gameTitle = GAME_TITLE;

  borderStyle!: string;

  @ViewChild('dialogCanvas')
  dialogCanvas!: ElementRef<HTMLCanvasElement>;

  private _canvas!: HTMLCanvasElement;
  private _ctx!: CanvasRenderingContext2D | null;
  private _boxesTop!: boxParticle[];
  private _boxesBottom!: boxParticle[];
  private _levelColors!: string[];
  private _levelEmojis!: EmojiInfo;

  constructor(
    private textureManager: TextureManagerService,
    private audioManager: AudioManagerService,
    private store: StoreService,
    private dialogNotify: DialogNotifyService,
    @Inject(MAT_DIALOG_DATA) public data: LevelDialogData
  ) {
    this.textureManager.LevelTexturesLoaded.subscribe(() => {
      this.texturesStillLoading = false;
    });
    this.textureManager.LevelTextureLoadProgress.subscribe((progress) => {
      this.progress = progress;
    });

    this.dialogNotify.DialogNotifyEvent.subscribe(() => {
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

    this.timerEvent.pipe(delay(550)).subscribe((stat: LevelStat) => {
      switch (stat.statType) {
        case LevelElementType.fastMatchBonusTotal:
          this.fastMatchBonusTotal = stat.statValue;
          this.audioManager.PlayAudio(AudioType.LEVEL_STAT);
          break;

        case LevelElementType.fastestMatchMs:
          if (this.fastMatchBonusTotal) {
            // only show if there was a bonus involved
            this.fastestMatchMs = stat.statValue / 1000;
            this.audioManager.PlayAudio(AudioType.LEVEL_STAT);
          }
          break;

        case LevelElementType.moveCount:
          this.moveCount = stat.statValue;
          this.audioManager.PlayAudio(AudioType.LEVEL_STAT);
          break;

        case LevelElementType.moveCountEarned:
          this.moveCountEarned = stat.statValue;
          this.audioManager.PlayAudio(AudioType.LEVEL_STAT);
          break;

        case LevelElementType.pieceCount:
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
    this.setScene();
  }

  ngOnDestroy(): void {
    if (this._timerQueue.length) {
      this._timerQueue = [];
    }
    this.timerEvent.complete();
    this.timerEvent.unsubscribe();

    cancelAnimationFrame(this._animateRequestId);
  }

  private setData(levelData: LevelDialogData): void {
    // reset values
    this._timerQueue = [];
    this.fastMatchBonusTotal = 0;
    this.fastestMatchMs = 0;
    this.moveCount = 0;
    this.moveCountEarned = 0;
    this.pieceCount = 0;

    if (levelData.stats.fastMatchBonusTotal) {
      this._timerQueue.push({
        statType: LevelElementType.fastMatchBonusTotal,
        statValue: levelData.stats.fastMatchBonusTotal,
      });
    }

    if (levelData.stats.fastestMatchMs) {
      this._timerQueue.push({
        statType: LevelElementType.fastestMatchMs,
        statValue: levelData.stats.fastestMatchMs,
      });
    }

    if (levelData.stats.moveCount) {
      this._timerQueue.push({
        statType: LevelElementType.moveCount,
        statValue: levelData.stats.moveCount,
      });
    }

    if (levelData.stats.moveCountEarned) {
      this._timerQueue.push({
        statType: LevelElementType.moveCountEarned,
        statValue: levelData.stats.moveCountEarned,
      });
    }

    if (levelData.stats.pieceCount) {
      this._timerQueue.push({
        statType: LevelElementType.pieceCount,
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

  private setScene(): void {
    this._levelColors = this.store.LevelColors;
    this._levelEmojis = this.store.EmojiInfo;

    this._canvas = this.dialogCanvas.nativeElement;
    // resize canvas to match css size
    this._canvas.width = this._canvas.clientWidth;
    this._canvas.height = this._canvas.clientHeight;

    this._ctx = this._canvas.getContext('2d');
    if (this._ctx) {
      // create boxes
      this._boxesTop = [];
      this._boxesBottom = [];
      for (let i = 0; i < 20; i++) {
        this._boxesTop.push(this.createBox());
        this._boxesBottom.push(this.createBox(true));
      }

      this.animate();
    }
  }

  private createBox(isBottom: boolean = false): boxParticle {
    const size = MathUtils.randInt(20, 50);
    const x = MathUtils.randInt(0, this._canvas.width);
    const velocity = MathUtils.randFloat(0.1, 0.3);

    let y = -size;
    let limit = MathUtils.randInt(20, 40);
    if (isBottom) {
      y = this._canvas.height + size;
      limit = this._canvas.height - (limit + size);
    }

    // color
    let color = '';
    if (this._levelColors?.length) {
      color = this._levelColors[MathUtils.randInt(0, this._levelColors.length - 1)];
    }

    // emoji
    let emoji = '';
    if (this._levelEmojis?.emojiList?.length) {
      emoji = this._levelEmojis.emojiList[MathUtils.randInt(0, this._levelEmojis.emojiList.length - 1)]
        .emojiCode as string;
    }

    return { size, x, y, velocity, limit, color, emoji };
  }

  private updateBoxes(): void {
    if (this._ctx) {
      this._ctx.fillStyle = 'rgba(255,255,255,0.1)';
      this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

      // box lengths are the same
      for (let i = 0; i < this._boxesTop.length; i++) {
        // top
        this._boxesTop[i].y += this._boxesTop[i].velocity;
        if (this._boxesTop[i].y > this._boxesTop[i].limit) {
          this._boxesTop[i] = this.createBox();
        }
        const boxTop = this._boxesTop[i];
        if (boxTop.color) {
          this._ctx.fillStyle = boxTop.color as string;
          this._ctx.fillRect(boxTop.x, boxTop.y, boxTop.size, boxTop.size);
        } else if (boxTop.emoji) {
          this._ctx.font = `${boxTop.size}px Arial`;
          this._ctx.fillText(boxTop.emoji, boxTop.x, boxTop.y, boxTop.size);
        }

        // bottom
        this._boxesBottom[i].y -= this._boxesBottom[i].velocity;
        if (this._boxesBottom[i].y < this._boxesBottom[i].limit) {
          this._boxesBottom[i] = this.createBox(true);
        }
        const boxBottom = this._boxesBottom[i];
        if (boxBottom.color) {
          this._ctx.fillStyle = boxBottom.color as string;
          this._ctx.fillRect(boxBottom.x, boxBottom.y, boxBottom.size, boxBottom.size);
        } else if (boxBottom.emoji) {
          this._ctx.font = `${boxBottom.size}px Arial`;
          this._ctx.fillText(boxBottom.emoji, boxBottom.x, boxBottom.y, boxBottom.size);
        }
      }
    }
  }

  private animate(): void {
    this.updateBoxes();

    this._animateRequestId = requestAnimationFrame(() => {
      this.animate();
    });
  }
}
