import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';

import { CanvasComponent } from './components/canvas/canvas.component';
import { GameContainerComponent } from './components/game-container/game-container.component';
import { LevelDialogComponent } from './components/dialogs/level-dialog/level-dialog.component';

import { GameEngineService } from './services/game-engine.service';
import { InteractionManagerService } from './services/interaction-manager.service';
import { SceneManagerService } from './services/scene-manager.service';
import { MaterialManagerService } from './services/material-manager.service';
import { ObjectManagerService } from './services/object-manager.service';
import { ScoringManagerService } from './services/scoring-manager.service';
import { EffectsManagerService } from './services/effects-manager.service';
import { TextureManagerService } from './services/texture-manager.service';
import { AudioManagerService } from './services/audio-manager.service';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

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
    AudioManagerService,
  ],
})
export class GameModule {}
