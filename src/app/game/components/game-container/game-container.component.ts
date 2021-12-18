import { Component, NgZone, OnInit } from '@angular/core';
import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';

@Component({
  selector: 'wgl-game-container',
  templateUrl: './game-container.component.html',
  styleUrls: ['./game-container.component.scss'],
})
export class GameContainerComponent implements OnInit {
  constructor(
    private ngZone: NgZone,
    private sceneManager: SceneManagerService,
    private objectManager: ObjectManagerService
  ) {}

  ngOnInit(): void {
    this.animate();
  }

  private animate(): void {
    this.ngZone.runOutsideAngular(() => {
      this.objectManager.UpdateShapes();
      this.sceneManager.RenderScene();

      requestAnimationFrame(() => {
        this.animate();
      });
    });
  }
}