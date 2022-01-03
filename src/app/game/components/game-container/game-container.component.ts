import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MathUtils } from 'three';
import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { TextureManagerService } from '../../services/texture-manager.service';
import { LevelDialogComponent } from '../dialogs/level-dialog/level-dialog.component';

@Component({
  selector: 'wgl-game-container',
  templateUrl: './game-container.component.html',
  styleUrls: ['./game-container.component.scss'],
})
export class GameContainerComponent implements OnInit {
  constructor(
    private ngZone: NgZone,
    private dialog: MatDialog,
    private sceneManager: SceneManagerService,
    private objectManager: ObjectManagerService,
    private textureManager: TextureManagerService,
    public scoringManager: ScoringManagerService
  ) {}

  ngOnInit(): void {
    const materialType = this.startNextLevel();

    let welcomeDialog = this.dialog.open(LevelDialogComponent, {
      maxWidth: '25em',
      disableClose: true,
      data: { level: this.scoringManager.Level, materialType: materialType },
    });

    // level close event
    welcomeDialog.afterClosed().subscribe(() => {
      this.sceneManager.InitScene();
      this.animate();
    });

    this.objectManager.LevelCompleted.subscribe(() => {
      const materialType = this.startNextLevel();
      const levelDialog = this.dialog.open(LevelDialogComponent, {
        maxWidth: '25em',
        disableClose: true,
        data: { level: this.scoringManager.Level, materialType: materialType },
      });
      levelDialog.afterClosed().subscribe(() => {
        this.objectManager.InitShapes();
      });
    });
  }

  private startNextLevel(): number {
    const textureType = MathUtils.randInt(1, 3);
    this.textureManager.InitLevelTextures(textureType);
    return textureType;
  }

  private animate(): void {
    this.objectManager.UpdateShapes();
    this.ngZone.runOutsideAngular(() => {
      this.sceneManager.RenderScene();
    });

    requestAnimationFrame(() => {
      this.animate();
    });
  }
}
