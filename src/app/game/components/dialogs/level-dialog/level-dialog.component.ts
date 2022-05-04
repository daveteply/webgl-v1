import { Component, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { delay } from 'rxjs';
import { GAME_TITLE, MINIMUM_MATCH_COUNT } from 'src/app/game/game-constants';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
import { LevelDialogData } from './level-dialog-data';

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

@Component({
  selector: 'wgl-level-dialog',
  templateUrl: './level-dialog.component.html',
  styleUrls: ['./level-dialog.component.scss'],
})
export class LevelDialogComponent implements OnDestroy {
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

  constructor(private textureManager: TextureManagerService, @Inject(MAT_DIALOG_DATA) public data: LevelDialogData) {
    this.textureManager.LevelTexturesLoaded.subscribe(() => {
      this.texturesStillLoading = false;
    });
    this.textureManager.LevelTextureLoadProgress.subscribe((progress) => {
      this.progress = progress;
    });

    this.timerEvent.pipe(delay(600)).subscribe((stat: LevelStat) => {
      switch (stat.statType) {
        case LevelElementType.fastMatchBonusTotal:
          this.fastMatchBonusTotal = stat.statValue;
          break;

        case LevelElementType.fastestMatchMs:
          this.fastestMatchMs = stat.statValue;
          break;

        case LevelElementType.moveCount:
          this.moveCount = stat.statValue;
          break;

        case LevelElementType.moveCountEarned:
          this.moveCountEarned = stat.statValue;
          break;

        case LevelElementType.pieceCount:
          this.pieceCount = stat.statValue;
          break;

        default:
          break;
      }

      this.processQueue();
    });

    this.setData(data);
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
}
