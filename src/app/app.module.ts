import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { WglSharedModule } from './shared/wgl-shared.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, HammerModule, BrowserAnimationsModule, WglSharedModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
