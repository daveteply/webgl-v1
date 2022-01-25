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
  private _nextLevelTextureType: number = 1;

  constructor(
    private ngZone: NgZone,
    private dialog: MatDialog,
    private sceneManager: SceneManagerService,
    private objectManager: ObjectManagerService,
    private textureManager: TextureManagerService,
    public scoringManager: ScoringManagerService
  ) {}

  ngOnInit(): void {
    this.initNextLevelTextures();
    this._dialogRef = this.dialog.open(LevelDialogComponent, this.diagConfig());

    this._dialogRef.afterClosed().subscribe(() => {
      this.handleDialogCLosed();
    });

    // level complete
    this.objectManager.LevelCompleted.subscribe(() => {
      this.initNextLevelTextures();

      // dialog will show loading progress of texture(s)
      this._dialogRef = this.dialog.open(
        LevelDialogComponent,
        this.diagConfig()
      );
      this._dialogRef.afterClosed().subscribe(() => {
        this.handleDialogCLosed();
      });
    });
  }

  private initNextLevelTextures(): void {
    // decide next level texture(s)
    this._nextLevelTextureType = MathUtils.randInt(1, 3);

    // start loading next level texture(s)
    this.textureManager.InitLevelTextures(this._nextLevelTextureType);
  }

  private diagConfig(): any {
    return {
      maxWidth: '25em',
      disableClose: true,
      data: {
        isWelcome: this._showWelcome,
        stats: this.scoringManager.LevelStats,
        materialType: this._nextLevelTextureType,
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
