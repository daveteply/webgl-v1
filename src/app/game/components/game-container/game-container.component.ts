import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { IntroDialogComponent } from '../dialogs/intro-dialog/intro-dialog.component';

@Component({
  selector: 'wgl-game-container',
  templateUrl: './game-container.component.html',
  styleUrls: ['./game-container.component.scss'],
})
export class GameContainerComponent implements OnInit {
  private introDialogRef!: MatDialogRef<IntroDialogComponent>;

  constructor(
    private ngZone: NgZone,
    private dialog: MatDialog,
    private sceneManager: SceneManagerService,
    private objectManager: ObjectManagerService,
    public scoringManager: ScoringManagerService
  ) {}

  ngOnInit(): void {
    this.introDialogRef = this.dialog.open(IntroDialogComponent, {
      maxWidth: '25em',
    });

    this.introDialogRef.afterClosed().subscribe(() => {
      this.sceneManager.InitScene();
      this.animate();
    });
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
