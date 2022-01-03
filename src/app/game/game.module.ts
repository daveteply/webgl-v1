import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from './components/canvas/canvas.component';
import { GameContainerComponent } from './components/game-container/game-container.component';
import { GameRoutingModule } from './game-routing.module';

import { GameEngineService } from './services/game-engine.service';
import { InteractionManagerService } from './services/interaction-manager.service';
import { SceneManagerService } from './services/scene-manager.service';
import { MaterialManagerService } from './services/material-manager.service';
import { ObjectManagerService } from './services/object-manager.service';
import { ScoringManagerService } from './services/scoring-manager.service';
import { EffectsManagerService } from './services/effects-manager.service';

import { LevelDialogComponent } from './components/dialogs/level-dialog/level-dialog.component';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TextureManagerService } from './services/texture-manager.service';

@NgModule({
  declarations: [CanvasComponent, GameContainerComponent, LevelDialogComponent],
  imports: [
    CommonModule,
    GameRoutingModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
  ],
  providers: [
    SceneManagerService,
    MaterialManagerService,
    TextureManagerService,
    ObjectManagerService,
    InteractionManagerService,
    GameEngineService,
    ScoringManagerService,
    EffectsManagerService,
  ],
})
export class GameModule {}
