import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';

import { GameContainerComponent } from './components/game-container/game-container.component';
import { LevelDialogComponent } from './components/dialogs/level-dialog/level-dialog.component';
import { IntroDialogComponent } from './components/dialogs/intro-dialog/intro-dialog.component';
import { GameOverDialogComponent } from './components/dialogs/game-over-dialog/game-over-dialog.component';
import { TextZoomComponent } from './components/text-zoom/text-zoom.component';
import { ZoomCharComponent } from './components/text-zoom/zoom-char/zoom-char.component';
import { MovesLeftComponent } from './components/moves-left/moves-left.component';
import { HighScoresComponent } from './components/high-scores/high-scores.component';
import { MovesRemainingInfoComponent } from './components/dialogs/hints/moves-remaining-info/moves-remaining-info.component';
import { HowToPlayComponent } from './components/dialogs/hints/how-to-play/how-to-play.component';
import { ShareContentComponent } from './components/share-content/share-content.component';
import { GameMenuComponent } from './components/game-menu/game-menu.component';

import { GameEngineService } from './services/game-engine.service';
import { InteractionManagerService } from './services/interaction-manager.service';
import { SceneManagerService } from './services/scene-manager.service';
import { MaterialManagerService } from './services/material/material-manager.service';
import { ObjectManagerService } from './services/object-manager.service';
import { ScoringManagerService } from './services/scoring-manager.service';
import { EffectsManagerService } from './services/effects-manager.service';
import { TextureManagerService } from './services/texture/texture-manager.service';
import { ShareManagerService } from './services/share-manager.service';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    GameContainerComponent,
    IntroDialogComponent,
    LevelDialogComponent,
    GameOverDialogComponent,
    TextZoomComponent,
    ZoomCharComponent,
    MovesLeftComponent,
    HighScoresComponent,
    MovesRemainingInfoComponent,
    HowToPlayComponent,
    ShareContentComponent,
    GameMenuComponent,
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    MatProgressBarModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
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
    ShareManagerService,
  ],
})
export class GameModule {}
