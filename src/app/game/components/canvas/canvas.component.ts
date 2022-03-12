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

  constructor(
    private sceneManager: SceneManagerService,
    private interactionManager: InteractionManagerService,
    private layoutManager: LayoutManagerService
  ) {}

  ngAfterViewInit(): void {
    const el = this.canvas?.nativeElement;
    if (el) {
      this.sceneManager.InitRenderer(el);
      this.interactionManager.InitInteractions(el);
    }

    this.sceneManager.UpdateSize(this.layoutManager.Width, this.layoutManager.Height);
    this.updateSize();

    this.layoutManager.OnResize.subscribe(() => {
      this.sceneManager.UpdateSize(this.layoutManager.Width, this.layoutManager.Height);
      this.updateSize();
    });
  }

  private updateSize(): void {
    const rect = this.canvas?.nativeElement.getBoundingClientRect();
    if (rect) {
      this.sceneManager.UpdateSize(rect.width, rect.height);
      this.interactionManager.CanvasRect = rect;
    }
  }
}
