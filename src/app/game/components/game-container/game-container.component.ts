import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MathUtils } from 'three';
import { ObjectManagerService } from '../../services/object-manager.service';
import { SceneManagerService } from '../../services/scene-manager.service';
import { ScoringManagerService } from '../../services/scoring-manager.service';
import { TextureManagerService } from '../../services/texture/texture-manager.service';
import { LevelDialogComponent } from '../dialogs/level-dialog/level-dialog.component';
import * as TWEEN from '@tweenjs/tween.js';

@Component({
  selector: 'wgl-game-container',
  templateUrl: './game-container.component.html',
  styleUrls: ['./game-container.component.scss'],
})
export class GameContainerComponent implements OnInit {
  private _dialogRef!: MatDialogRef<LevelDialogComponent>;
  private _showWelcome: boolean = true;

  constructor(
    private ngZone: NgZone,
    private dialog: MatDialog,
    private sceneManager: SceneManagerService,
    private objectManager: ObjectManagerService,
    private textureManager: TextureManagerService,
    public scoringManager: ScoringManagerService
  ) {}

  ngOnInit(): void {
    this._dialogRef = this.dialog.open(LevelDialogComponent, this.diagConfig());

    this._dialogRef.afterClosed().subscribe(() => {
      this.handleDialogCLosed();
    });

    // level complete
    this.objectManager.LevelCompleted.subscribe(() => {
      const materialType = this.preloadTextures();
      this._dialogRef = this.dialog.open(
        LevelDialogComponent,
        this.diagConfig()
      );
      this._dialogRef.afterClosed().subscribe(() => {
        this.handleDialogCLosed();
      });
    });
  }

  private diagConfig(): any {
    return {
      maxWidth: '25em',
      disableClose: true,
      data: {
        isWelcome: this._showWelcome,
        stats: this.scoringManager.LevelStats,
        materialType: this.preloadTextures(),
      },
    };
  }

  private handleDialogCLosed(): void {
    if (this._showWelcome) {
      // set up scene and animate
      this.sceneManager.InitScene();
      this.animate();
      this._showWelcome = false;
    } else {
      this.scoringManager.NextLevel();
      this.objectManager.InitShapes();
    }
  }

  private preloadTextures(): number {
    const textureType = MathUtils.randInt(1, 3);
    this.textureManager.InitLevelTextures(textureType);
    return textureType;
  }

  private animate(): void {
    TWEEN.update();
    this.ngZone.runOutsideAngular(() => {
      this.sceneManager.RenderScene();
    });

    requestAnimationFrame(() => {
      this.animate();
    });
  }
}
