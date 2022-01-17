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

  public AnimateLevelChangeAnimation(
    gameWheels: GameWheel[],
    verticalTargets: number[],
    camera: PerspectiveCamera,
    start: boolean
  ): void {
    const introTweens: any[] = [];

    let vTargets = [...verticalTargets];
    if (!start) {
      vTargets = verticalTargets.map((t) => {
        return -10;
      });
    }

    // vertical movement tweens
    let delay = 0;
    gameWheels.forEach((wheel, inx) => {
      delay += 100;
      introTweens.push(wheel.AnimateLevelStartTween(vTargets[inx], delay));
    });

    // opacity of each game piece
    gameWheels.forEach((wheel) => {
      for (const gamePiece of wheel.children as GamePiece[]) {
        if (!gamePiece.IsMatch) {
          gamePiece.AnimateLevelChangeTween(start);
        }
      }
    });

    // animate camera
    const delta = { z: start ? 0.0 : 5.0, rotX: start ? Math.PI / 2 : 0 };
    const target = { z: start ? 5.0 : 0.0, rotX: start ? 0.0 : Math.PI / 2 };
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
