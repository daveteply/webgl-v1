import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GainControlComponent } from './components/gain-control/gain-control.component';

import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [GainControlComponent],
  imports: [CommonModule, MatSliderModule, MatButtonModule, MatIconModule],
  exports: [GainControlComponent],
})
export class WglSharedModule {}
