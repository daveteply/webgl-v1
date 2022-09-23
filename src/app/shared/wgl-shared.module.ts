import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

import { GainControlComponent } from './components/gain-control/gain-control.component';
import { AboutComponent } from './components/about/about.component';
import { ShareContentComponent } from './components/share-content/share-content.component';

@NgModule({
  declarations: [GainControlComponent, AboutComponent, ShareContentComponent],
  imports: [CommonModule, MatSliderModule, MatButtonModule, MatIconModule, MatDialogModule],
  exports: [GainControlComponent, AboutComponent, ShareContentComponent],
})
export class WglSharedModule {}
