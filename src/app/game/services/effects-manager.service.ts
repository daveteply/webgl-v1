import { EventEmitter, Injectable } from '@angular/core';
import { Tween } from '@tweenjs/tween.js';
import { MathUtils, PerspectiveCamera } from 'three';
import {
  HALF_PI,
  MINIMUM_MATCH_COUNT,
  WHEEL_START_POSITION,
} from '../game-constants';
import { GamePiece } from '../models/game-piece/game-piece';
import { GameWheel } from '../models/game-wheel';
import { AudioType } from 'src/app/shared/services/audio/audio-info';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { ScoringManagerService } from './scoring-manager.service';

@Injectable()
export class EffectsManagerService {
  private _selectionTweens: any[] = [];
  private _levelChangeCameraTween1: any;
  private _levelChangeCameraTween2: any;

  SelectionAnimationComplete: EventEmitter<boolean> = new EventEmitter();
  LevelChangeAnimation: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private audioManager: AudioManagerService,
    private scoringManager: ScoringManagerService
  ) {}

  public AnimateLevelChangeAnimation(
    gameWheels: GameWheel[],
    verticalTargets: number[],
    camera: PerspectiveCamera,
    start: boolean
  ): void {
    if (!camera) {
      return;
    }

    // stop currently running tween
    if (this._levelChangeCameraTween1) {
      this._levelChangeCameraTween1.stop();
    }
    if (this._levelChangeCameraTween2) {
      this._levelChangeCameraTween2.stop();
    }

    this.LevelChangeAnimation.next(true);

    let vTargets = [...verticalTargets];
    if (!start) {
      vTargets = verticalTargets.map(() => {
        return -WHEEL_START_POSITION;
      });
    }

    // animate camera
    const delta1 = start ? { z: 5.0, rotX: 0 } : { z: 5.0, rotX: 0 };
    const target1 = start ? { z: 0, rotX: HALF_PI } : { z: 0, rotX: -HALF_PI };
    this._levelChangeCameraTween1 = new Tween(delta1)
      .to(target1, start ? 750 : 3000)
      .onUpdate(() => {
        camera.rotation.x = delta1.rotX;
        camera.position.z = delta1.z;
      });

    const delta2 = start ? { z: 0, rotX: HALF_PI } : { z: 0, rotX: -HALF_PI };
    const target2 = start ? { z: 5.0, rotX: 0 } : { z: 5.0, rotX: 0 };
    this._levelChangeCameraTween2 = new Tween(delta2)
      .to(target2, start ? 2000 : 2000)
      .delay(1250)
      .onUpdate(() => {
        camera.rotation.x = delta2.rotX;
        camera.position.z = delta2.z;
      })
      .onComplete(() => {
        this.LevelChangeAnimation.next(false);
        this.scoringManager.ResetTimer();
      });

    // vertical movement tweens
    const introSpinDirection = MathUtils.randInt(1, 3);
    let delay = 0;
    gameWheels.forEach((wheel, inx) => {
      delay += 250;
      wheel.AnimateLevelStartTween(
        vTargets[inx],
        delay,
        start,
        introSpinDirection
      );
    });

    // opacity of each game piece
    gameWheels.forEach((wheel) => {
      for (const gamePiece of wheel.children as GamePiece[]) {
        if (!gamePiece.IsMatch) {
          gamePiece.AnimateLevelChangeTween(start);
        }
      }
    });

    this._levelChangeCameraTween1.chain(this._levelChangeCameraTween2);
    this._levelChangeCameraTween1.start();
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

      const isMinMatch = pieces.length >= MINIMUM_MATCH_COUNT;
      if (isMinMatch) {
        this.scoringManager.StopTimer();
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

      // audio
      this.audioManager.StartProgression();
      this._selectionTweens.forEach((tween) => {
        tween.onStart(() => {
          if (isMinMatch) {
            this.scoringManager.UpdateLevelProgress();
          }
          this.audioManager.PlayAudio(
            select ? AudioType.PIECE_SELECT : AudioType.MATCH_FAIL,
            select ? true : false
          );
        });
      });

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
      selectedPieces.forEach((p) => {
        p.InitRemovalTween();
        this.audioManager.PlayAudio(AudioType.PIECE_REMOVE);
      });
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
