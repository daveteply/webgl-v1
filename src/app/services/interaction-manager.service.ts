import { Injectable } from '@angular/core';
import { ObjectManagerService } from './object-manager.service';
import 'hammerjs';
import { MathUtils, PerspectiveCamera, Raycaster, Vector2 } from 'three';
import { ROTATIONAL_CONSTANT } from '../wgl-constants';
import { Plate } from '../models/plate';

@Injectable({
  providedIn: 'root',
})
export class InteractionManagerService {
  private _hammer!: HammerManager;

  private _clientSize: Vector2;
  private _pointerPos: Vector2;

  private _x: number = 0;
  private _panning: boolean = false;
  private _activePlate: Plate | undefined;

  private _rayCaster!: Raycaster;
  private _camera!: PerspectiveCamera;

  constructor(private objectManager: ObjectManagerService) {
    this._rayCaster = new Raycaster();
    this._clientSize = new Vector2();
    this._pointerPos = new Vector2();
  }

  public InitInteractions(el: HTMLElement): void {
    this._hammer = new Hammer(el);

    this._hammer.on('panstart', (panStartEvent) => {
      const uuid = this.pickedMeshUUID(
        panStartEvent.center.x,
        panStartEvent.center.y
      );
      if (uuid) {
        const targetPlate = this.objectManager.FindPlate(uuid);
        if (targetPlate) {
          this._activePlate = targetPlate;
          this.objectManager.SetActivePlate(targetPlate);
        }
      }
    });

    this._hammer.on('pan', (panEvent) => {
      if (!this._panning) {
        this._panning = true;
      } else {
        this.deviceCordRotation(panEvent.center.x);
      }

      if (panEvent.isFinal) {
        this._panning = false;
        this._activePlate?.SnapToGrid();
        this._activePlate = undefined;
      }

      this._x = panEvent.center.x;
    });

    this._hammer.on('press', (pressEvent) => {
      console.log('press', pressEvent);
    });
  }

  public OnResize(
    width: number,
    height: number,
    camera: PerspectiveCamera
  ): void {
    this._clientSize.x = width;
    this._clientSize.y = height;
    this._camera = camera;
  }

  private deviceCordRotation(x: number): void {
    const deltaX = x - this._x;
    if (this._activePlate) {
      this._activePlate.UpdateTheta(
        MathUtils.degToRad(deltaX) *
          (ROTATIONAL_CONSTANT / this._clientSize.x) *
          -1
      );
    }
  }

  private pickedMeshUUID(x: number, y: number): string | undefined {
    if (this._camera) {
      this._pointerPos.x = (x / this._clientSize.x) * 2 - 1;
      this._pointerPos.y = -(y / this._clientSize.y) * 2 + 1;
      this._rayCaster.setFromCamera(this._pointerPos, this._camera);
      const intersects = this._rayCaster.intersectObjects(
        this.objectManager.Axis.map((m) => m.Hub)
      );

      return intersects[0]?.object?.uuid;
    }
    return undefined;
  }
}
