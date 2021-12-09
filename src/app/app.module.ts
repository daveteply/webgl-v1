import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas/canvas.component';

@NgModule({
  declarations: [AppComponent, CanvasComponent],
  imports: [BrowserModule, AppRoutingModule, HammerModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
