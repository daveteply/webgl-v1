import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from './components/canvas/canvas.component';
import { GameContainerComponent } from './components/game-container/game-container.component';
import { GameRoutingModule } from './game-routing.module';

@NgModule({
  declarations: [CanvasComponent, GameContainerComponent],
  imports: [CommonModule, GameRoutingModule],
})
export class GameModule {}
