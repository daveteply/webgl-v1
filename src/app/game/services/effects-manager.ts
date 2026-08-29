import { Injectable, inject, isDevMode } from '@angular/core';
import { Subject } from 'rxjs';

import { Easing, Tween } from '@tweenjs/tween.js';
import { mainTweenGroup } from './tween-group';
import { MathUtils, Object3D, PerspectiveCamera, PointLight } from 'three';

import { AudioManagerService } from '../../shared/services/audio/audio-manager';
import { HapticsManagerService } from '../../shared/services/haptics-manager';
import { ScoringManagerService } from './scoring-manager';
import { MaterialManagerService } from './material/material-manager';
import { PieceMaterials } from './material/material-models';
import { GameEngineService } from './game-engine';

import {
  CAMERA_HORIZONTAL_OFFSET,
  DECIMAL_COMPARISON_TOLERANCE,
  GRID_VERTICAL_OFFSET,
  HALF_PI,
  HORIZONTAL_TURN_DURATION,
  MINIMUM_MATCH_COUNT,
  WHEEL_START_POSITION,
} from '../game-constants';
import { GamePiece, PieceStateSnapshot } from '../models/game-piece/game-piece';
import { GameWheel } from '../models/game-wheel';
import { GravityType } from '../models/gravity-type';
import { AudioType } from '../../shared/services/audio/audio-data';
import { PowerMoveType } from '../models/power-move-type';
import { LEVEL_ANIMATION_STYLES, LevelAnimationStyle } from '../models/level-animation-style';
import { LevelOrientationType } from '../models/level-orientation-type';

@Injectable({
  providedIn: 'root',
})
export class EffectsManagerService {
  private audioManager = inject(AudioManagerService);
  private scoringManager = inject(ScoringManagerService);
  private hapticsManager = inject(HapticsManagerService);
  private materialManager = inject(MaterialManagerService);
  private gameEngine = inject(GameEngineService);

  private _selectionTweens: Tween<Record<string, number>>[] = [];
  private _levelChangeCameraTween1?: Tween<Record<string, number>>;
  private _levelChangeCameraTween2?: Tween<Record<string, number>>;
  private _horizontalTurnTween?: Tween<Record<string, number>>;

  private _selectedPieces: Object3D[] = [];
  get SelectedPieces(): Object3D[] {
    return this._selectedPieces;
  }

  SelectionAnimationComplete: Subject<boolean> = new Subject<boolean>();
  LevelChangeAnimation: Subject<boolean> = new Subject<boolean>();
  GravityAnimationComplete: Subject<void> = new Subject<void>();
  PowerMoveAnimationComplete: Subject<void> = new Subject<void>();
  RemoveAnimationComplete: Subject<void> = new Subject<void>();

  public AnimateLevelChangeAnimation(
    gameWheels: GameWheel[],
    verticalTargets: number[],
    camera: PerspectiveCamera,
    light: PointLight,
    start: boolean,
    customStyle?: LevelAnimationStyle,
    customOrientation?: LevelOrientationType,
  ): void {
    // clear selected for highlighting
    if (start) {
      this._selectedPieces = [];
    }

    // lock board (interact manager)
    this.LevelChangeAnimation.next(true);

    // stop currently running camera tweens
    this._levelChangeCameraTween1?.stop();
    this._levelChangeCameraTween2?.stop();
    this._horizontalTurnTween?.stop();

    // Select random level transition animation style if not explicitly passed
    const activeStyle = customStyle ?? LEVEL_ANIMATION_STYLES[MathUtils.randInt(0, LEVEL_ANIMATION_STYLES.length - 1)];
    const activeOrientation = customOrientation ?? this.gameEngine.LevelOrientation ?? LevelOrientationType.Vertical;

    if (isDevMode()) {
      console.info('Level Animation Style: ', LevelAnimationStyle[activeStyle]);
      console.info('Active Orientation: ', LevelOrientationType[activeOrientation]);
    }

    // animate camera
    const startRotZ = camera?.rotation?.z || 0;
    const startPosX = camera?.position?.x || 0;
    const startPosY = camera?.position?.y || 0;

    const delta1 = { z: 5.0, rotX: 0, rotZ: startRotZ, posX: startPosX, posY: startPosY, l: 400 };
    const target1 = start
      ? { z: 0, rotX: HALF_PI, rotZ: 0, posX: 0, posY: 0, l: 2000 }
      : { z: 0, rotX: -HALF_PI, rotZ: 0, posX: 0, posY: 0, l: 2000 };

    this._levelChangeCameraTween1 = new Tween(delta1, mainTweenGroup).to(target1, start ? 750 : 3000).onUpdate(() => {
      if (camera) {
        camera.rotation.x = delta1.rotX;
        camera.rotation.z = delta1.rotZ;
        camera.position.x = delta1.posX;
        camera.position.y = delta1.posY;
        camera.position.z = delta1.z;
      }
      if (light) {
        light.intensity = delta1.l;
      }
    });

    const delta2 = start ? { z: 0, rotX: HALF_PI, l: 2000 } : { z: 0, rotX: -HALF_PI, l: 2000 };
    const target2 = { z: 5.0, rotX: 0, l: 400 };
    this._levelChangeCameraTween2 = new Tween(delta2, mainTweenGroup)
      .to(target2, 2000)
      .delay(1250)
      .onUpdate(() => {
        if (camera) {
          camera.rotation.x = delta2.rotX;
          camera.position.z = delta2.z;
        }
        if (light) {
          light.intensity = delta2.l;
        }
      })
      .onComplete(() => {
        if (start && activeOrientation !== LevelOrientationType.Vertical) {
          // Animate horizontal turn (90 deg left or right) with audio
          const targetRotZ = activeOrientation === LevelOrientationType.HorizontalRight ? -HALF_PI : HALF_PI;
          const targetPosX =
            CAMERA_HORIZONTAL_OFFSET * (activeOrientation === LevelOrientationType.HorizontalRight ? 1 : -1);

          this.audioManager.PlayAudio(AudioType.HORIZONTAL_TURN);

          const deltaTurn = { rotZ: 0, posX: 0 };
          this._horizontalTurnTween = new Tween(deltaTurn, mainTweenGroup)
            .to({ rotZ: targetRotZ, posX: targetPosX }, HORIZONTAL_TURN_DURATION)
            .easing(Easing.Cubic.InOut)
            .onUpdate(() => {
              if (camera) {
                camera.rotation.z = deltaTurn.rotZ;
                camera.position.x = deltaTurn.posX;
              }
            })
            .onComplete(() => {
              if (camera) {
                camera.rotation.z = targetRotZ;
                camera.position.x = targetPosX;
              }
              this.LevelChangeAnimation.next(false);
              this.scoringManager.ResetTimer();
            });

          this._horizontalTurnTween.start();
        } else {
          if (camera) {
            camera.rotation.z = 0;
            camera.position.x = 0;
            camera.position.y = 0;
          }
          // unlock board (interact manager)
          this.LevelChangeAnimation.next(false);
          this.scoringManager.ResetTimer();
        }
      });

    // vertical movement and horizontal rotations tweens
    const introSpinDirection = MathUtils.randInt(1, 3);
    let delay = 0;
    gameWheels.forEach((wheel, inx) => {
      delay += 200;
      const targetY = start ? verticalTargets[inx] : -WHEEL_START_POSITION;
      wheel.AnimateLevelStartTween(targetY, delay, start, introSpinDirection, activeStyle);
    });

    this._levelChangeCameraTween1.chain(this._levelChangeCameraTween2);
    this._levelChangeCameraTween1.start();
  }

  public AnimatePowerMove(gameWheels: GameWheel[], moveType: PowerMoveType): void {
    switch (moveType) {
      case PowerMoveType.HorizontalLeft:
      case PowerMoveType.HorizontalRight:
      case PowerMoveType.HorizontalMix: {
        gameWheels.forEach((wheel) => {
          wheel.AnimateHorizontalPowerMove(moveType);
        });
        new Tween({ t: 0 }, mainTweenGroup)
          .to({ t: 1 }, 2500)
          .onComplete(() => {
            this.PowerMoveAnimationComplete.next();
          })
          .start();
        break;
      }

      case PowerMoveType.VerticalUp:
      case PowerMoveType.VerticalDown:
      case PowerMoveType.VerticalMix: {
        gameWheels.forEach((wheel) => {
          wheel.AnimateVerticalPowerMove(moveType);
        });
        new Tween({ t: 0 }, mainTweenGroup)
          .to({ t: 1 }, 2250)
          .onComplete(() => {
            this.PowerMoveAnimationComplete.next();
          })
          .start();
        break;
      }
    }
  }

  public AnimateLock(axle: GameWheel[], lock: boolean): void {
    axle.forEach((a) => {
      for (const child of a.children) {
        const gamePiece = child as GamePiece;
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
      pieces.forEach((p) => this._selectionTweens.push(p.InitSelectionTween(select)));
      // start the chained tween upon completion of the initial tween
      for (let i = 0; i < this._selectionTweens.length - 1; i++) {
        this._selectionTweens[i].chain(this._selectionTweens[i + 1]);
      }
      this._selectionTweens[0].delay(250);

      // audio and selection
      this.audioManager.SetMinNote();
      this._selectionTweens.forEach((tween, inx) => {
        tween.onStart(() => {
          // update selected for highlight
          if (select) {
            this._selectedPieces.push(pieces[inx]);
          } else {
            this._selectedPieces.pop();
          }

          if (isMinMatch) {
            this.scoringManager.UpdateLevelProgress();
          }
          this.audioManager.PlayAudio(select ? AudioType.PIECE_SELECT : AudioType.MATCH_FAIL, select);
        });
      });

      // tween
      this._selectionTweens[0].start();

      // complete
      this._selectionTweens[this._selectionTweens.length - 1].onComplete(() => {
        if (!select) {
          this._selectedPieces = [];
        }
        this.SelectionAnimationComplete.next(select);
      });
    }
  }

  public ClearSelectedPieces(): void {
    this._selectedPieces = [];
  }

  public AnimateRemove(selectedPieces: GamePiece[]): void {
    if (!selectedPieces || !selectedPieces.length) {
      this.RemoveAnimationComplete.next();
      return;
    }

    let completed = false;
    let remaining = selectedPieces.length;
    const notifyComplete = () => {
      remaining--;
      if (remaining <= 0 && !completed) {
        completed = true;
        this.RemoveAnimationComplete.next();
      }
    };

    selectedPieces.forEach((p) => {
      const tween = p.AnimateRemovalTween(Math.floor(Math.random() * 6));
      tween.onComplete(notifyComplete).onStop(notifyComplete);
    });

    const removeSoundType =
      selectedPieces.length > MINIMUM_MATCH_COUNT ? AudioType.PIECE_REMOVE_2 : AudioType.PIECE_REMOVE;
    this.audioManager.PlayAudio(removeSoundType);
    this.hapticsManager.LightTap();
  }

  public AnimateFlip(gamePiece: GamePiece, velocity: number, directionUp: boolean): void {
    gamePiece.AnimateFlipTween(Math.floor(velocity), directionUp);
  }

  public AnimateGravity(axle: GameWheel[], gravityType: GravityType): void {
    if (gravityType === GravityType.None || !axle.length) {
      this.GravityAnimationComplete.next();
      return;
    }

    if (gravityType === GravityType.Mix) {
      gravityType = Math.random() < 0.5 ? GravityType.Down : GravityType.Up;
      if (isDevMode()) {
        console.info('Mix Gravity Resolved To:', gravityType);
      }
    }

    this._selectedPieces = [];

    // Stop ongoing removal/scatter tweens and reset mesh position/rotation to local origin
    axle.forEach((wheel) => {
      for (const piece of wheel.children as GamePiece[]) {
        piece.StopTweens(true);
      }
    });

    const numWheels = axle.length;
    const firstWheel = axle[0];
    const piecesPerWheel = firstWheel.children.length;

    // Group pieces into columns by ThetaOffset
    const columns: GamePiece[][] = [];
    const samplePieces = firstWheel.children as GamePiece[];

    for (let pIdx = 0; pIdx < piecesPerWheel; pIdx++) {
      const samplePiece = samplePieces[pIdx];
      const column: GamePiece[] = [];
      for (let wIdx = 0; wIdx < numWheels; wIdx++) {
        const wheelPieces = axle[wIdx].children as GamePiece[];
        const matchPiece = wheelPieces.find(
          (p) => Math.abs(p.ThetaOffset - samplePiece.ThetaOffset) < DECIMAL_COMPARISON_TOLERANCE,
        );
        if (matchPiece) {
          column.push(matchPiece);
        }
      }
      if (column.length === numWheels) {
        columns.push(column);
      }
    }

    interface ShiftAction {
      targetPiece: GamePiece;
      sourcePiece?: GamePiece;
      isNewSpawn: boolean;
      startOffsetY: number;
      newMaterial?: PieceMaterials;
    }

    const actionsToAnimate: ShiftAction[] = [];
    let hasAnyShift = false;

    for (const col of columns) {
      const removedIndices: number[] = [];
      col.forEach((p, idx) => {
        if (p.IsRemoved && !p.IsPowerMove) removedIndices.push(idx);
      });

      if (removedIndices.length === 0) continue;

      hasAnyShift = true;
      const numRemoved = removedIndices.length;

      if (gravityType === GravityType.Down) {
        const lowestRemoved = Math.min(...removedIndices);

        const nonRemovedAbove: GamePiece[] = [];
        for (let i = lowestRemoved; i < numWheels; i++) {
          if (!col[i].IsRemoved || col[i].IsPowerMove) {
            nonRemovedAbove.push(col[i]);
          }
        }

        nonRemovedAbove.forEach((sourceP, i) => {
          const targetIdx = lowestRemoved + i;
          const targetP = col[targetIdx];
          const sourceIdx = col.indexOf(sourceP);
          const steps = sourceIdx - targetIdx;
          const startOffsetY = steps * GRID_VERTICAL_OFFSET;

          actionsToAnimate.push({
            targetPiece: targetP,
            sourcePiece: sourceP,
            isNewSpawn: false,
            startOffsetY,
          });
        });

        const newSpawnCount = numWheels - (lowestRemoved + nonRemovedAbove.length);
        for (let i = 0; i < newSpawnCount; i++) {
          const targetIdx = numWheels - newSpawnCount + i;
          const targetP = col[targetIdx];
          const startOffsetY = (numRemoved + i) * GRID_VERTICAL_OFFSET;
          const newMat = this.materialManager.GetRandomPieceMaterial();

          actionsToAnimate.push({
            targetPiece: targetP,
            isNewSpawn: true,
            startOffsetY,
            newMaterial: newMat,
          });
        }
      } else if (gravityType === GravityType.Up) {
        const highestRemoved = Math.max(...removedIndices);

        const nonRemovedBelow: GamePiece[] = [];
        for (let i = 0; i <= highestRemoved; i++) {
          if (!col[i].IsRemoved || col[i].IsPowerMove) {
            nonRemovedBelow.push(col[i]);
          }
        }

        nonRemovedBelow
          .slice()
          .reverse()
          .forEach((sourceP, i) => {
            const targetIdx = highestRemoved - i;
            const targetP = col[targetIdx];
            const sourceIdx = col.indexOf(sourceP);
            const steps = sourceIdx - targetIdx;
            const startOffsetY = steps * GRID_VERTICAL_OFFSET;

            actionsToAnimate.push({
              targetPiece: targetP,
              sourcePiece: sourceP,
              isNewSpawn: false,
              startOffsetY,
            });
          });

        const newSpawnCount = highestRemoved + 1 - nonRemovedBelow.length;
        for (let i = 0; i < newSpawnCount; i++) {
          const targetIdx = i;
          const targetP = col[targetIdx];
          const startOffsetY = -(numRemoved + (newSpawnCount - 1 - i)) * GRID_VERTICAL_OFFSET;
          const newMat = this.materialManager.GetRandomPieceMaterial();

          actionsToAnimate.push({
            targetPiece: targetP,
            isNewSpawn: true,
            startOffsetY,
            newMaterial: newMat,
          });
        }
      }
    }

    if (!hasAnyShift || actionsToAnimate.length === 0) {
      this.GravityAnimationComplete.next();
      return;
    }

    // Sound cue when gravity slide begins
    this.audioManager.PlayAudio(AudioType.GRAVITY_EFFECT);

    // Save snapshot of source pieces before copying state
    const snapshots = new Map<GamePiece, PieceStateSnapshot>();
    actionsToAnimate.forEach((action) => {
      if (action.sourcePiece && !snapshots.has(action.sourcePiece)) {
        snapshots.set(action.sourcePiece, action.sourcePiece.GetStateSnapshot());
      }
    });

    const tweens: Tween<Record<string, number>>[] = [];
    const duration = 1000;

    actionsToAnimate.forEach((action) => {
      if (action.isNewSpawn && action.newMaterial) {
        action.targetPiece.Reset(this.gameEngine.LevelGeometryType ?? 0);
        action.targetPiece.UpdateMaterials(action.newMaterial);
      } else if (action.sourcePiece) {
        const snap = snapshots.get(action.sourcePiece);
        if (snap) {
          action.targetPiece.ApplyStateSnapshot(snap);
        }
      }
      action.targetPiece.IsMatch = false;

      const tween = action.targetPiece.AnimateGravitySlide(action.startOffsetY, duration);
      tweens.push(tween);
    });

    if (tweens.length) {
      new Tween({ t: 0 }, mainTweenGroup)
        .to({ t: 1 }, duration)
        .onComplete(() => {
          this.GravityAnimationComplete.next();
        })
        .start();

      tweens.forEach((t) => t.start());
    } else {
      this.GravityAnimationComplete.next();
    }
  }
}
