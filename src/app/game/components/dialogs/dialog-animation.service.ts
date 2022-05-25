import { Injectable, OnDestroy } from '@angular/core';
import { EmojiInfo } from 'src/app/app-store/models/emoji-info';
import { StoreService } from 'src/app/app-store/services/store.service';
import { MathUtils } from 'three';
import { INTRO_DIALOG_COLORS } from '../../game-constants';
import { Easing, Tween } from '@tweenjs/tween.js';
import * as TWEEN from '@tweenjs/tween.js';

interface boxParticle {
  x: number;
  y: number;
  size: number;
  velocity?: number;
  limit?: number;
  color?: string;
  emoji?: string;
}

interface introRows {
  rows: Array<boxParticle[]>;
}

enum DialogAnimationType {
  Intro = 1,
  Level,
}

@Injectable({
  providedIn: 'root',
})
export class DialogAnimationService implements OnDestroy {
  private _boxesTop!: boxParticle[];
  private _boxesBottom!: boxParticle[];
  private _levelColors!: string[];
  private _levelEmojis!: EmojiInfo;

  private _introBoxRows!: introRows;
  private _introTween!: any;
  private _introAnimateRight: boolean = true;

  private _canvas!: HTMLCanvasElement;
  private _ctx!: CanvasRenderingContext2D | null;

  private _animationType!: DialogAnimationType;

  private _animateRequestId!: number;

  constructor(private store: StoreService) {}

  ngOnDestroy(): void {
    this.cleanUp();
  }

  public Dispose(): void {
    this.cleanUp();
  }

  private cleanUp(): void {
    if (this._introTween) {
      this._introTween.stop();
      delete this._introTween;
    }
    if (this._animateRequestId) {
      cancelAnimationFrame(this._animateRequestId);
    }
  }

  public SetScene(canvas: HTMLCanvasElement): void {
    if (canvas) {
      this._canvas = canvas;

      // resize canvas to match css size
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      // get level data
      this._levelColors = this.store.LevelColors;
      this._levelEmojis = this.store.EmojiInfo;

      // main context
      this._ctx = canvas.getContext('2d');
    }
  }

  public Animate(): void {
    switch (this._animationType) {
      case DialogAnimationType.Intro:
        // this.drawIntroDialogBoxes();
        TWEEN.update();
        break;

      case DialogAnimationType.Level:
        this.updateLevelDialogBoxes();
        break;
    }

    this._animateRequestId = requestAnimationFrame(() => {
      this.Animate();
    });
  }

  public CreateIntroDialogBoxes(): void {
    this._animationType = DialogAnimationType.Intro;

    const size: number = 44;
    const offset: number = 5;
    const rowCount: number = 4;

    if (this._ctx) {
      const rows = [];
      for (let i = 0; i < rowCount; i++) {
        rows.push(this.createIntroRow(size, offset, i * (size + offset)));
      }

      this._introBoxRows = { rows };
      this.drawIntroDialogBoxes();

      let targetRowIndex = MathUtils.randInt(1, rowCount - 1);
      const delta = { x: 0.0 };
      const target = { x: 4.0 };

      this._introTween = new Tween(delta)
        .to(target, 900)
        .delay(1000)
        .repeat(Infinity)
        .onUpdate(() => {
          for (let i = 0; i < this._introBoxRows.rows[targetRowIndex].length; i++) {
            const box = this._introBoxRows.rows[targetRowIndex][i];
            if (this._introAnimateRight) {
              box.x += delta.x;
            } else {
              box.x -= delta.x;
            }
            this.drawIntroDialogBoxes();
          }
        })
        .onRepeat(() => {
          this._introAnimateRight = !this._introAnimateRight;
          if (this._introAnimateRight) {
            targetRowIndex = MathUtils.randInt(1, rowCount - 1);
          }
        })
        .start();
    }
  }

  private createIntroRow(size: number, offset: number, y: number): boxParticle[] {
    const boxesPerRow = 16;

    const boxesWidth = boxesPerRow * (size + offset) - offset;
    const marginOffset = this._canvas.width / 2 - boxesWidth / 2;

    const row: boxParticle[] = [];
    for (let i = 0; i < boxesPerRow; i++) {
      row.push({
        size,
        x: i * (size + offset) + marginOffset,
        y,
        color: this.randomColor(),
      });
    }
    return row;
  }

  public CreateLevelDialogBoxes(): void {
    this._animationType = DialogAnimationType.Level;

    if (this._ctx) {
      // create boxes
      this._boxesTop = [];
      this._boxesBottom = [];
      for (let i = 0; i < 25; i++) {
        this._boxesTop.push(this.createLevelDialogBox());
        this._boxesBottom.push(this.createLevelDialogBox(true));
      }
    }
  }

  private createLevelDialogBox(isBottom: boolean = false): boxParticle {
    const size = MathUtils.randInt(20, 50);
    const x = MathUtils.randInt(0, this._canvas.width);
    const velocity = MathUtils.randFloat(0.13, 0.27);

    let y = -size;
    let limit = MathUtils.randInt(20, 40);
    if (isBottom) {
      y = this._canvas.height + size;
      limit = this._canvas.height - (limit + size);
    }

    return { size, x, y, velocity, limit, color: this.randomColor(), emoji: this.randomEmoji() };
  }

  private randomColor(): string {
    let color = '';
    if (this._levelColors?.length) {
      color = this._levelColors[MathUtils.randInt(0, this._levelColors.length - 1)];
    }
    if (!color) {
      color = INTRO_DIALOG_COLORS[MathUtils.randInt(0, INTRO_DIALOG_COLORS.length - 1)];
    }
    return color;
  }

  private randomEmoji(): string {
    let emoji = '';
    if (this._levelEmojis?.emojiList?.length) {
      emoji = this._levelEmojis.emojiList[MathUtils.randInt(0, this._levelEmojis.emojiList.length - 1)]
        .emojiCode as string;
    }
    return emoji;
  }

  private updateLevelDialogBoxes(): void {
    if (this._ctx) {
      this._ctx.fillStyle = 'rgba(255,255,255,0.1)';
      this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

      // box lengths are the same
      for (let i = 0; i < this._boxesTop.length; i++) {
        // top
        this._boxesTop[i].y += this._boxesTop[i].velocity || 0;
        if (this._boxesTop[i].y > (this._boxesTop[i].limit || 0)) {
          this._boxesTop[i] = this.createLevelDialogBox();
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
        this._boxesBottom[i].y -= this._boxesBottom[i].velocity || 0;
        if (this._boxesBottom[i].y < (this._boxesBottom[i].limit || 0)) {
          this._boxesBottom[i] = this.createLevelDialogBox(true);
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

  private drawIntroDialogBoxes(): void {
    if (this._ctx) {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

      for (let i = 0; i < this._introBoxRows.rows.length; i++) {
        const row = this._introBoxRows.rows[i];
        for (let j = 0; j < row.length; j++) {
          const box = row[j];
          this._ctx.fillStyle = box.color as string;
          this._ctx.fillRect(box.x, box.y, box.size, box.size);
        }
      }
    }
  }
}
