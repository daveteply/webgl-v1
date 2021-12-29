import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { IntroDialogComponent } from '../dialogs/intro-dialog/intro-dialog.component';
import { LevelDialogComponent } from '../dialogs/level-dialog/level-dialog.component';

@Component({
  selector: 'wgl-game-container',
  templateUrl: './game-container.component.html',
  styleUrls: ['./game-container.component.scss'],
})
export class GameContainerComponent implements OnInit {
  private introDialogRef!: MatDialogRef<IntroDialogComponent>;
  private levelDialogRef!: MatDialogRef<LevelDialogComponent>;

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
      disableClose: true,
    });

    this.introDialogRef.afterClosed().subscribe(() => {
      this.sceneManager.InitScene();
      this.animate();
    });

    this.objectManager.LevelCompleted.subscribe(() => {
      this.levelDialogRef = this.dialog.open(LevelDialogComponent, {
        disableClose: true,
      });
      this.levelDialogRef.afterClosed().subscribe(() => {
        this.objectManager.InitShapes();
      });
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
