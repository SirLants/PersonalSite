import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OverlayModule } from '@angular/cdk/overlay';

import { AppRoutingModule } from './app-routing.module';

import { ParallaxDirective } from './directives/parallax.directive';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { BeansComponent } from './beans/beans.component';
import { ImageManagerComponent } from './image-manager/image-manager.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BeansComponent,
    ParallaxDirective,
    ImageManagerComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    OverlayModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
