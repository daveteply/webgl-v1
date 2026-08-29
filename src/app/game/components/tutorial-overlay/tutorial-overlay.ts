import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HintsManagerService, TutorialConfig } from '../../services/hints-manager';
import { InteractionManagerService } from '../../services/interaction-manager';

export interface SpotlightGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  ry: number;
  cx: number;
  cy: number;
  cardTop?: number;
  cardBottom?: number;
}

@Component({
  selector: 'wgl-tutorial-overlay',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './tutorial-overlay.html',
  styleUrl: './tutorial-overlay.scss',
})
export class TutorialOverlay implements OnInit, OnDestroy {
  public hintsManager = inject(HintsManagerService);
  private interactionManager = inject(InteractionManagerService);
  private document = inject(DOCUMENT);

  spotlight = signal<SpotlightGeometry | null>(null);
  isAnimatingIn = signal<boolean>(false);

  private resizeObserver?: ResizeObserver;
  private animTimer?: ReturnType<typeof setTimeout>;

  activeTutorial = computed(() => this.hintsManager.activeTutorial());
  isActive = computed(() => this.hintsManager.isTutorialActive());

  constructor() {
    effect(() => {
      const active = this.hintsManager.activeTutorial();
      if (active) {
        this.interactionManager.LockBoard(true);
        this.updateSpotlight(active);
        this.triggerEnterAnimation();
      } else {
        this.interactionManager.LockBoard(false);
        this.spotlight.set(null);
      }
    });
  }

  ngOnInit(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        const active = this.hintsManager.activeTutorial();
        if (active) {
          this.updateSpotlight(active);
        }
      });
      this.resizeObserver.observe(this.document.body);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.animTimer) {
      clearTimeout(this.animTimer);
    }
  }

  private triggerEnterAnimation(): void {
    this.isAnimatingIn.set(true);
    if (this.animTimer) {
      clearTimeout(this.animTimer);
    }
    this.animTimer = setTimeout(() => {
      this.isAnimatingIn.set(false);
    }, 850);
  }

  private updateSpotlight(config: TutorialConfig): void {
    const windowWidth = window.innerWidth || 360;
    const windowHeight = window.innerHeight || 640;

    const isBoardTarget =
      !config.targetSelector || config.targetSelector === '.game-canvas' || config.spotlightShape === 'board';

    let targetEl: HTMLElement | null = null;
    if (!isBoardTarget && config.targetSelector) {
      targetEl = this.document.querySelector<HTMLElement>(config.targetSelector);
    }

    if (!isBoardTarget && targetEl && targetEl.offsetParent !== null) {
      const rect = targetEl.getBoundingClientRect();
      const pad = 12;
      const x = Math.max(0, rect.left - pad);
      const y = Math.max(0, rect.top - pad);
      const width = Math.min(windowWidth - x, rect.width + pad * 2);
      const height = Math.min(windowHeight - y, rect.height + pad * 2);
      const radius = config.spotlightShape === 'pill' ? height / 2 : 16;

      let cardTop: number | undefined;
      let cardBottom: number | undefined;

      if (y > windowHeight * 0.6) {
        cardBottom = Math.max(16, windowHeight - y + 14);
      } else {
        cardTop = Math.min(y + height + 14, windowHeight - 160);
      }

      this.spotlight.set({
        x,
        y,
        width,
        height,
        rx: radius,
        ry: radius,
        cx: x + width / 2,
        cy: y + height / 2,
        cardTop,
        cardBottom,
      });
    } else {
      // Board center spotlight
      const cx = windowWidth / 2;
      const cy = windowHeight * 0.44;
      const width = Math.min(windowWidth * 0.78, 290);
      const height = Math.min(windowHeight * 0.34, 230);
      const x = cx - width / 2;
      const y = cy - height / 2;
      const rx = 36;
      const ry = 36;
      const cardTop = Math.min(y + height + 16, windowHeight - 160);

      this.spotlight.set({
        x,
        y,
        width,
        height,
        rx,
        ry,
        cx,
        cy,
        cardTop,
      });
    }
  }

  public onGotIt(): void {
    this.hintsManager.DismissCurrentTutorial();
  }

  public onSkipAll(): void {
    this.hintsManager.SkipAllTutorials();
  }
}
