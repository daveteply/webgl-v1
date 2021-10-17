import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  ViewChild,
} from '@angular/core';
import { SceneManagerService } from '../services/scene-manager.service';

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
    @Inject(DOCUMENT) private readonly documentRef: Document
  ) {}

  ngAfterViewInit(): void {
    this.sceneManager.InitRenderer(this.canvas.nativeElement);
  }
}
