import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { SceneManagerService } from '../services/scene-manager.service';
import { InteractionManagerService } from '../services/interaction-manager.service';

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
    private interactionManager: InteractionManagerService
  ) {}

  ngAfterViewInit(): void {
    this.sceneManager.InitRenderer(this.canvas.nativeElement);
    this.interactionManager.InitInteractions(this.canvas.nativeElement);
  }
}
