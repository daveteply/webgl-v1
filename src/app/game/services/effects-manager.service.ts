import { EventEmitter, Injectable } from '@angular/core';
import { Tween } from '@tweenjs/tween.js';
import { PerspectiveCamera } from 'three';
import { GamePiece } from '../models/game-piece/game-piece';
import { GameWheel } from '../models/game-wheel';

@Injectable()
export class EffectsManagerService {
  private _selectionTweens: any[] = [];

  SelectionAnimationComplete: EventEmitter<boolean> = new EventEmitter();
  IntroAnimationComplete: EventEmitter<void> = new EventEmitter();

  public AnimateLevelStartAnimation(
    gameWheels: GameWheel[],
    verticalTargets: number[],
    camera: PerspectiveCamera
  ): void {
    const introTweens: any[] = [];

    // vertical movement tweens
    let delay = 0;
    gameWheels.forEach((wheel, inx) => {
      delay += 100;
      introTweens.push(
        wheel.AnimateLevelStartTween(verticalTargets[inx], delay)
      );
    });

    // opacity of each game piece
    gameWheels.forEach((wheel) => {
      for (const gamePiece of wheel.children as GamePiece[]) {
        if (!gamePiece.IsMatch) {
          gamePiece.AnimateLevelStartTween();
        }
      }
    });

    // animate camera
    const delta = { z: 0.0, rotX: Math.PI / 2 };
    const target = { z: 5.0, rotX: 0.0 };
    new Tween(delta)
      .to(target, 1000)
      .delay(2000)
      .onUpdate(() => {
        camera.rotation.x = delta.rotX;
        camera.position.z = delta.z;
      })
      .onComplete(() => {
        this.IntroAnimationComplete.next();
      })
      .start();
  }

  public AnimateLock(axle: GameWheel[], lock: boolean): void {
    axle.forEach((a) => {
      for (const gamePiece of a.children as GamePiece[]) {
        if (!gamePiece.IsMatch) {
          gamePiece.AnimateLock(lock);
        }
      }
    });
  }

  public AnimateSelected(selectedPieces: GamePiece[], select: boolean): void {
    if (selectedPieces.length) {
      // stop if currently running
      this._selectionTweens.forEach((t) => t.stop());
      this._selectionTweens = [];

      // set direction
      const pieces = [...selectedPieces];
      if (!select) {
        pieces.reverse();
      }

      // init tweens
      pieces.forEach((p) =>
        this._selectionTweens.push(p.InitSelectionTween(select))
      );
      // start the chained tween upon completion of the initial tween
      for (let i = 0; i < this._selectionTweens.length - 1; i++) {
        this._selectionTweens[i].chain(this._selectionTweens[i + 1]);
      }
      this._selectionTweens[0].delay(250);

      // tween
      this._selectionTweens[0].start();

      // complete
      this._selectionTweens[this._selectionTweens.length - 1].onComplete(() => {
        this.SelectionAnimationComplete.next(select);
      });
    }
  }

  public AnimateRemove(selectedPieces: GamePiece[]): void {
    if (selectedPieces.length) {
      selectedPieces.forEach((p) => p.InitRemovalTween());
    }
  }

  public AnimateFlip(
    gamePiece: GamePiece,
    velocity: number,
    directionUp: boolean
  ): void {
    const flipTween = gamePiece.InitFlipTween(
      Math.floor(velocity),
      directionUp
    );
  }
}
