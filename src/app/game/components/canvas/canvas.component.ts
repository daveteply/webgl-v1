import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { SceneManagerService } from '../../services/scene-manager.service';
import { InteractionManagerService } from '../../services/interaction-manager.service';

@Component({
  selector: 'wgl-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('mainCanvas')
  public canvas!: ElementRef<HTMLCanvasElement>;

  @HostListener('window:resize')
  onResize() {
    this.sceneManager.UpdateSize(
      this.canvas?.nativeElement.getBoundingClientRect()
    );
  }

  constructor(
    private sceneManager: SceneManagerService,
    private interactionManager: InteractionManagerService
  ) {}

  ngAfterViewInit(): void {
    const el = this.canvas?.nativeElement;
    if (el) {
      this.sceneManager.UpdateSize(el.getBoundingClientRect());
      this.sceneManager.InitRenderer(el);
      this.interactionManager.InitInteractions(el);
    }
  }
}
