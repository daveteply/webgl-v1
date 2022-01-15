import { EventEmitter, Injectable } from '@angular/core';
import { INTRO_VERTICAL_CASCADE } from '../game-constants';
import { GamePiece } from '../models/game-piece/game-piece';
import { GameWheel } from '../models/game-wheel';
import { Betweener } from '../models/keyframes/betweener';

enum EffectTypes {
  Intro = 1,
}

@Injectable()
export class EffectsManagerService {
  private _activeEffects: EffectTypes[] = [];
  private _introBetweeners: Betweener[] = [];
  private _selectionTweens: any[] = [];

  SelectionAnimationComplete: EventEmitter<boolean> = new EventEmitter();

  public UpdateEffects(axle: GameWheel[]): void {
    if (this._activeEffects.length) {
      if (this._activeEffects.find((e) => e === EffectTypes.Intro)) {
        this.animateIntro(axle);
      }
    }
  }

  public InitIntoAnimation(
    gameWheels: GameWheel[],
    verticalTargets: number[],
    startY: number
  ): void {
    this._introBetweeners = [];
    if (startY < 0) {
      for (let i = gameWheels.length - 1; i > -1; i--) {
        const tweener = new Betweener(
          gameWheels[i].position.y,
          verticalTargets[i],
          INTRO_VERTICAL_CASCADE * (gameWheels.length - i)
        );
        this._introBetweeners.push(tweener);
      }
    } else {
      for (let i = 0; i < gameWheels.length; i++) {
        const tweener = new Betweener(
          gameWheels[i].position.y,
          verticalTargets[i],
          INTRO_VERTICAL_CASCADE * (i + 1)
        );
        this._introBetweeners.push(tweener);
      }
    }

    this._activeEffects.push(EffectTypes.Intro);
  }

  private animateIntro(axle: GameWheel[]): void {
    if (this._introBetweeners.some((i) => i.HasNext)) {
      this._introBetweeners.forEach((wheel, inx) => {
        if (wheel.HasNext) {
          axle[inx].position.y = wheel.Next;
        }
      });
    } else {
      this.removeActiveEffect(EffectTypes.Intro);
    }
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

  private removeActiveEffect(effect: EffectTypes): void {
    this._activeEffects.splice(
      this._activeEffects.findIndex((a) => a === effect),
      1
    );
  }
}
