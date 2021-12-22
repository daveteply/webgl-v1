import { Injectable } from '@angular/core';
import { INTRO_VERTICAL_CASCADE } from '../game-constants';
import { GameWheel } from '../models/game-wheel';
import { Betweener } from '../models/keyframes/betweener';

enum EffectTypes {
  Intro,
}

@Injectable()
export class EffectsManagerService {
  private _activeEffects: EffectTypes[] = [];

  private _introBetweeners: Betweener[] = [];

  public UpdateEffects(axle: GameWheel[]): void {
    if (this._activeEffects.length) {
      this.animateIntro(axle);
    }
  }

  public BuildIntoAnimation(
    gameWheels: GameWheel[],
    verticalTargets: number[]
  ): void {
    this._introBetweeners = [];
    for (let i = 0; i < gameWheels.length; i++) {
      const tweener = new Betweener(
        gameWheels[i].position.y,
        verticalTargets[i],
        INTRO_VERTICAL_CASCADE * (i + 1)
      );
      this._introBetweeners.push(tweener);
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
      this._activeEffects.splice(
        this._activeEffects.findIndex((a) => a === EffectTypes.Intro),
        1
      );
    }
  }
}
