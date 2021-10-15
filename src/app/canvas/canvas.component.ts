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

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: any) {
    this.sceneManager.UpdateCursorPosition(
      (e.clientX / (this.documentRef.defaultView?.innerWidth || 1)) * 2 - 1,
      -(e.clientY / (this.documentRef.defaultView?.innerHeight || 1)) * 2 + 1
    );
  }

  constructor(
    private sceneManager: SceneManagerService,
    @Inject(DOCUMENT) private readonly documentRef: Document
  ) {}

  ngAfterViewInit(): void {
    this.sceneManager.InitRenderer(this.canvas.nativeElement);
  }
}
