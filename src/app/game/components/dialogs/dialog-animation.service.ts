import { Injectable, OnDestroy } from '@angular/core';
import { EmojiInfo } from 'src/app/app-store/models/emoji-info';
import { StoreService } from 'src/app/app-store/services/store.service';
import { MathUtils } from 'three';

interface boxParticle {
  x: number;
  y: number;
  size: number;
  velocity: number;
  limit: number;
  color?: string;
  emoji?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DialogAnimationService implements OnDestroy {
  private _boxesTop!: boxParticle[];
  private _boxesBottom!: boxParticle[];
  private _levelColors!: string[];
  private _levelEmojis!: EmojiInfo;

  private _canvas!: HTMLCanvasElement;
  private _ctx!: CanvasRenderingContext2D | null;

  private _animateRequestId!: number;

  constructor(private store: StoreService) {}

  ngOnDestroy(): void {
    cancelAnimationFrame(this._animateRequestId);
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

  public CreateLevelDialogBoxes(): void {
    if (this._ctx) {
      // create boxes
      this._boxesTop = [];
      this._boxesBottom = [];
      for (let i = 0; i < 20; i++) {
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
      this.clearCanvas(this._ctx);

      // box lengths are the same
      for (let i = 0; i < this._boxesTop.length; i++) {
        // top
        this._boxesTop[i].y += this._boxesTop[i].velocity;
        if (this._boxesTop[i].y > this._boxesTop[i].limit) {
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
        this._boxesBottom[i].y -= this._boxesBottom[i].velocity;
        if (this._boxesBottom[i].y < this._boxesBottom[i].limit) {
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

  private clearCanvas(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
  }

  public Animate(): void {
    this.updateBoxes();

    this._animateRequestId = requestAnimationFrame(() => {
      this.Animate();
    });
  }
}
