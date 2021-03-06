import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { GameContainerComponent } from './components/game-container/game-container.component';

const routes: Routes = [{ path: '', component: GameContainerComponent }];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class GameRoutingModule {}
