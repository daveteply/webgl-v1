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

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [CanvasComponent, GameContainerComponent],
  imports: [
    CommonModule,
    GameRoutingModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    SceneManagerService,
    MaterialManagerService,
    ObjectManagerService,
    InteractionManagerService,
    GameEngineService,
    ScoringManagerService,
  ],
})
export class GameModule {}
