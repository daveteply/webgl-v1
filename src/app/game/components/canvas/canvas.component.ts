import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { SceneManagerService } from '../../services/scene-manager.service';
import { InteractionManagerService } from '../../services/interaction-manager.service';
import { LayoutManagerService } from 'src/app/shared/services/layout-manager.service';

@Component({
  selector: 'wgl-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('mainCanvas')
  public canvas!: ElementRef<HTMLCanvasElement>;

  private _canvasElement!: HTMLCanvasElement;

  constructor(
    private sceneManager: SceneManagerService,
    private interactionManager: InteractionManagerService,
    private layoutManager: LayoutManagerService
  ) {}

  ngAfterViewInit(): void {
    this._canvasElement = this.canvas?.nativeElement;
    if (this._canvasElement) {
      this.sceneManager.InitRenderer(this._canvasElement);
      this.interactionManager.InitInteractions(this._canvasElement);
    }

    this.layoutManager.OnResize.subscribe(() => {
      this.updateSize();
    });

    // set initial size
    this.sceneManager.UpdateSize(this.layoutManager.Width, this.layoutManager.Height);
    this.updateSize();
  }

  private updateSize(): void {
    if (this._canvasElement) {
      const rect = this.canvas?.nativeElement.getBoundingClientRect();
      if (rect) {
        this.interactionManager.CanvasRect = rect;
      }
    }
  }
}
