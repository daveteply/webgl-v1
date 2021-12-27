import { Injectable } from '@angular/core';
import { INTRO_VERTICAL_CASCADE } from '../game-constants';
import { GamePiece } from '../models/game-piece/game-piece';
import { GameWheel } from '../models/game-wheel';
import { Betweener } from '../models/keyframes/betweener';

enum EffectTypes {
  Intro = 1,
  Flip,
}

@Injectable()
export class EffectsManagerService {
  private _activeEffects: EffectTypes[] = [];

  private _introBetweeners: Betweener[] = [];

  private _flipTarget!: GamePiece;

  public UpdateEffects(axle: GameWheel[]): void {
    if (this._activeEffects.length) {
      if (this._activeEffects.find((e) => e === EffectTypes.Intro)) {
        this.animateIntro(axle);
      }
      if (this._activeEffects.find((e) => e === EffectTypes.Flip)) {
        this.animateFlip();
      }
    }
  }

  public BuildIntoAnimation(
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

  public Flip(targetGamePiece: GamePiece): void {
    this._flipTarget = targetGamePiece;
    this._activeEffects.push(EffectTypes.Flip);
  }

  private animateFlip(): void {
    if (!this._flipTarget.Flip()) {
      this.removeActiveEffect(EffectTypes.Flip);
    }
  }

  private removeActiveEffect(effect: EffectTypes): void {
    this._activeEffects.splice(
      this._activeEffects.findIndex((a) => a === effect),
      1
    );
  }
}
