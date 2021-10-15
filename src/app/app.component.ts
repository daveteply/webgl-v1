import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject, NgZone, OnInit } from '@angular/core';
import * as THREE from 'three';
import { ObjectManagerService } from './services/object-manager.service';
import { SceneManagerService } from './services/scene-manager.service';

@Component({
  selector: 'wgl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private sceneManager: SceneManagerService,
    private objectManager: ObjectManagerService,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private readonly documentRef: Document
  ) {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {});
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event) {
      this.sceneManager.UpdateSize(
        event.target?.innerWidth,
        event.target?.innerHeight
      );
    }
  }

  ngOnInit(): void {
    const winWidth = this.documentRef.defaultView?.innerWidth || 1;
    const winHeight = this.documentRef.defaultView?.innerHeight || 1;

    this.sceneManager.UpdateSize(winWidth, winHeight);

    this.sceneManager.SetCameraPos(new THREE.Vector3(5, 5, 15));

    this.animate();
  }

  private animate(): void {
    this.objectManager.UpdateShapes(this.sceneManager.scene);

    this.sceneManager.RenderScene();

    requestAnimationFrame(() => {
      this.animate();
    });
  }
}
