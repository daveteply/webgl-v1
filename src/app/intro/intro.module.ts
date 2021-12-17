import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntroContainerComponent } from './components/intro-container/intro-container.component';
import { IntroRoutingModule } from './intro-routing.module';

import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [IntroContainerComponent],
  imports: [CommonModule, IntroRoutingModule, RouterModule, MatButtonModule],
})
export class IntroModule {}
