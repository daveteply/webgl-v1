import { Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { InteractionManagerService } from '../../services/interaction-manager';
import { GameEngineService } from '../../services/game-engine';
import { EffectsManagerService } from '../../services/effects-manager';

@Component({
  selector: 'wgl-horizontal-level-navigator',
  imports: [CommonModule],
  templateUrl: './horizontal-level-navigator.html',
  styleUrl: './horizontal-level-navigator.scss',
})
export class HorizontalLevelNavigator implements OnInit, OnDestroy {
  public interactionManager = inject(InteractionManagerService);
  public gameEngine = inject(GameEngineService);
  public effectsManager = inject(EffectsManagerService);

  @ViewChild('trackRef') trackRef?: ElementRef<HTMLElement>;

  // Pan offset in range [-1, 1], where 0 is center
  panOffset = signal<number>(0);
  isBoardLocked = signal<boolean>(false);

  // 7 wheel segments
  readonly segments = [0, 1, 2, 3, 4, 5, 6];

  private _subscriptions: Subscription = new Subscription();
  private _isDraggingThumb = false;
  private _dragStartX = 0;
  private _dragStartPan = 0;

  // Normalized thumb position percentage [0, 100] for CSS positioning
  thumbPositionPercent = computed(() => {
    // panOffset [-1, 1] maps to [0, 100]
    return ((this.panOffset() + 1) / 2) * 100;
  });

  ariaValueNow = computed(() => {
    return Math.round(((this.panOffset() + 1) / 2) * 100);
  });

  ngOnInit(): void {
    this._subscriptions.add(
      this.interactionManager.PanChange.subscribe((offset) => {
        this.panOffset.set(offset);
      }),
    );

    this._subscriptions.add(
      this.effectsManager.LevelChangeAnimation.subscribe((locked) => {
        this.isBoardLocked.set(locked);
      }),
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
  }

  public stepPan(step: number): void {
    const current = this.panOffset();
    this.interactionManager.SetPan(current + step);
  }

  public onTrackClick(event: MouseEvent | PointerEvent): void {
    if (this._isDraggingThumb || !this.trackRef) return;
    const rect = this.trackRef.nativeElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    // map ratio [0, 1] to [-1, 1]
    const targetPan = ratio * 2 - 1;
    this.interactionManager.SetPan(targetPan);
  }

  public onThumbPointerDown(event: PointerEvent): void {
    event.stopPropagation();
    this._isDraggingThumb = true;
    this._dragStartX = event.clientX;
    this._dragStartPan = this.panOffset();

    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
  }

  private onPointerMove = (event: PointerEvent): void => {
    if (!this._isDraggingThumb || !this.trackRef) return;
    const rect = this.trackRef.nativeElement.getBoundingClientRect();
    const deltaX = event.clientX - this._dragStartX;
    const deltaPan = (deltaX / rect.width) * 2;
    this.interactionManager.SetPan(this._dragStartPan + deltaPan);
  };

  private onPointerUp = (): void => {
    this._isDraggingThumb = false;
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
  };

  public onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        this.stepPan(-0.1);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        this.stepPan(0.1);
        break;
      case 'PageUp':
        event.preventDefault();
        this.stepPan(-0.3);
        break;
      case 'PageDown':
        event.preventDefault();
        this.stepPan(0.3);
        break;
      case 'Home':
        event.preventDefault();
        this.interactionManager.SetPan(-1);
        break;
      case 'End':
        event.preventDefault();
        this.interactionManager.SetPan(1);
        break;
    }
  }
}

export { HorizontalLevelNavigator as HorizontalLevelNavigatorComponent };
