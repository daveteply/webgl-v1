import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';

import { GameContainerComponent } from './components/game-container/game-container.component';
import { LevelDialogComponent } from './components/dialogs/level-dialog/level-dialog.component';
import { GameOverComponent } from './components/dialogs/game-over/game-over.component';

import { GameEngineService } from './services/game-engine.service';
import { InteractionManagerService } from './services/interaction-manager.service';
import { SceneManagerService } from './services/scene-manager.service';
import { MaterialManagerService } from './services/material/material-manager.service';
import { ObjectManagerService } from './services/object-manager.service';
import { ScoringManagerService } from './services/scoring-manager.service';
import { EffectsManagerService } from './services/effects-manager.service';
import { TextureManagerService } from './services/texture/texture-manager.service';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { TextZoomComponent } from './components/text-zoom/text-zoom.component';
import { ZoomCharComponent } from './components/text-zoom/zoom-char/zoom-char.component';
import { MovesLeftComponent } from './components/moves-left/moves-left.component';

@NgModule({
  declarations: [
    GameContainerComponent,
    LevelDialogComponent,
    GameOverComponent,
    TextZoomComponent,
    ZoomCharComponent,
    MovesLeftComponent,
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatDialogModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
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
    DecimalPipe,
  ],
})
export class GameModule {}
