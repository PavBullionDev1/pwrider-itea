import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PunchingPageRoutingModule } from './punching-routing.module';
import { PunchingPage } from './punching.page';
import { HttpClientModule } from '@angular/common/http';
import { SwipeModule } from '../swipe/swipe.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PunchingPageRoutingModule,
    ReactiveFormsModule,
		HttpClientModule,
		SwipeModule,
    SharedModule],
  declarations: [
    PunchingPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PunchingPageModule {}
