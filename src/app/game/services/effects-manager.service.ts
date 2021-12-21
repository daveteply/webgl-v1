import { Injectable } from '@angular/core';
import { INTRO_VERTICAL_CASCADE } from '../game-constants';
import { GameWheel } from '../models/game-wheel';
import { Betweener } from '../models/keyframes/betweener';

@Injectable()
export class EffectsManagerService {
  private _introBetweener: Betweener[] = [];

  public BuildLevelChange(
    gameWheels: GameWheel[],
    verticalTargets: number[]
  ): void {
    this._introBetweener = [];
    for (let i = 0; i < gameWheels.length; i++) {
      const tweener = new Betweener(
        gameWheels[i].position.y,
        verticalTargets[i],
        INTRO_VERTICAL_CASCADE * (i + 1)
      );
      this._introBetweener.push(tweener);
    }
  }

  get IntroAnimating(): boolean {
    return this._introBetweener.some((i) => i.HasNext);
  }

  get IntroFrame(): Betweener[] {
    return this._introBetweener;
  }
}
