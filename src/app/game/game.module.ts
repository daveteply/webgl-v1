import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';

import { CanvasComponent } from './components/canvas/canvas.component';
import { GameContainerComponent } from './components/game-container/game-container.component';
import { LevelDialogComponent } from './components/dialogs/level-dialog/level-dialog.component';
import { GameOverComponent } from './components/dialogs/game-over/game-over.component';

import { GameEngineService } from './services/game-engine.service';
import { InteractionManagerService } from './services/interaction-manager.service';
import { SceneManagerService } from './services/scene-manager.service';
import { MaterialManagerService } from './services/material-manager.service';
import { ObjectManagerService } from './services/object-manager.service';
import { ScoringManagerService } from './services/scoring-manager.service';
import { EffectsManagerService } from './services/effects-manager.service';
import { TextureManagerService } from './services/texture/texture-manager.service';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [
    CanvasComponent,
    GameContainerComponent,
    LevelDialogComponent,
    GameOverComponent,
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    MatProgressBarModule,
    MatDialogModule,
    MatButtonModule,
    MatExpansionModule,
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
