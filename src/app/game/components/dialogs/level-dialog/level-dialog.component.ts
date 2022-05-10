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

  timerQueue: LevelStat[] = [];
  timerEvent: EventEmitter<LevelStat> = new EventEmitter<LevelStat>();

  gameTitle = GAME_TITLE;

  borderStyle!: string;

  @ViewChild('dialogCanvas')
  dialogCanvas!: ElementRef<HTMLCanvasElement>;

  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D | null;
  boxesTop!: boxParticle[];
  boxesBottom!: boxParticle[];
  levelColors!: string[];
  levelEmojis!: EmojiInfo;

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
    if (this.timerQueue.length) {
      this.timerQueue = [];
    }
    this.timerEvent.complete();
    this.timerEvent.unsubscribe();
  }

  private setData(levelData: LevelDialogData): void {
    // reset values
    this.timerQueue = [];
    this.fastMatchBonusTotal = 0;
    this.fastestMatchMs = 0;
    this.moveCount = 0;
    this.moveCountEarned = 0;
    this.pieceCount = 0;

    if (levelData.stats.fastMatchBonusTotal) {
      this.timerQueue.push({
        statType: LevelElementType.fastMatchBonusTotal,
        statValue: levelData.stats.fastMatchBonusTotal,
      });
    }

    if (levelData.stats.fastestMatchMs) {
      this.timerQueue.push({
        statType: LevelElementType.fastestMatchMs,
        statValue: levelData.stats.fastestMatchMs,
      });
    }

    if (levelData.stats.moveCount) {
      this.timerQueue.push({
        statType: LevelElementType.moveCount,
        statValue: levelData.stats.moveCount,
      });
    }

    if (levelData.stats.moveCountEarned) {
      this.timerQueue.push({
        statType: LevelElementType.moveCountEarned,
        statValue: levelData.stats.moveCountEarned,
      });
    }

    if (levelData.stats.pieceCount) {
      this.timerQueue.push({
        statType: LevelElementType.pieceCount,
        statValue: levelData.stats.pieceCount,
      });
    }

    this.processQueue();
  }

  private processQueue(): void {
    if (this.timerQueue.length) {
      const nextElement = this.timerQueue.shift();
      if (nextElement) {
        this.timerEvent.next(nextElement);
      }
    }
  }

  private setScene(): void {
    this.levelColors = this.store.LevelColors;
    this.levelEmojis = this.store.EmojiInfo;

    this.canvas = this.dialogCanvas.nativeElement;
    // resize canvas to match css size
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    this.ctx = this.canvas.getContext('2d');
    if (this.ctx) {
      // create boxes
      this.boxesTop = [];
      this.boxesBottom = [];
      for (let i = 0; i < 20; i++) {
        this.boxesTop.push(this.createBox());
        this.boxesBottom.push(this.createBox(true));
      }

      this.animate();
    }
  }

  private createBox(isBottom: boolean = false): boxParticle {
    const size = MathUtils.randInt(20, 50);
    const x = MathUtils.randInt(0, this.canvas.width);
    const velocity = MathUtils.randFloat(0.1, 0.3);

    let y = -size;
    let limit = MathUtils.randInt(20, 40);
    if (isBottom) {
      y = this.canvas.height + size;
      limit = this.canvas.height - (limit + size);
    }

    // color
    let color = '';
    if (this.levelColors?.length) {
      color = this.levelColors[MathUtils.randInt(0, this.levelColors.length - 1)];
    }

    // emoji
    let emoji = '';
    if (this.levelEmojis?.emojiList?.length) {
      emoji = this.levelEmojis.emojiList[MathUtils.randInt(0, this.levelEmojis.emojiList.length - 1)]
        .emojiCode as string;
    }

    return { size, x, y, velocity, limit, color, emoji };
  }

  private updateBoxes(): void {
    if (this.ctx) {
      this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // box lengths are the same
      for (let i = 0; i < this.boxesTop.length; i++) {
        // top
        this.boxesTop[i].y += this.boxesTop[i].velocity;
        if (this.boxesTop[i].y > this.boxesTop[i].limit) {
          this.boxesTop[i] = this.createBox();
        }
        const boxTop = this.boxesTop[i];
        if (boxTop.color) {
          this.ctx.fillStyle = boxTop.color as string;
          this.ctx.fillRect(boxTop.x, boxTop.y, boxTop.size, boxTop.size);
        } else if (boxTop.emoji) {
          this.ctx.font = `${boxTop.size}px Arial`;
          this.ctx.fillText(boxTop.emoji, boxTop.x, boxTop.y, boxTop.size);
        }

        // bottom
        this.boxesBottom[i].y -= this.boxesBottom[i].velocity;
        if (this.boxesBottom[i].y < this.boxesBottom[i].limit) {
          this.boxesBottom[i] = this.createBox(true);
        }
        const boxBottom = this.boxesBottom[i];
        if (boxBottom.color) {
          this.ctx.fillStyle = boxBottom.color as string;
          this.ctx.fillRect(boxBottom.x, boxBottom.y, boxBottom.size, boxBottom.size);
        } else if (boxBottom.emoji) {
          this.ctx.font = `${boxBottom.size}px Arial`;
          this.ctx.fillText(boxBottom.emoji, boxBottom.x, boxBottom.y, boxBottom.size);
        }
      }
    }
  }

  private animate(): void {
    this.updateBoxes();

    requestAnimationFrame(() => {
      this.animate();
    });
  }
}
