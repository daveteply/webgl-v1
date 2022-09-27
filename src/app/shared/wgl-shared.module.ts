import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

import { GainControlComponent } from './components/gain-control/gain-control.component';
import { AboutComponent } from './components/about/about.component';

@NgModule({
  declarations: [GainControlComponent, AboutComponent],
  imports: [CommonModule, MatSliderModule, MatButtonModule, MatIconModule, MatDialogModule],
  exports: [GainControlComponent, AboutComponent],
})
export class WglSharedModule {}
