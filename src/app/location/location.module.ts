import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocationPageRoutingModule } from './location-routing.module';

import { LocationPage } from './location.page';
import { SwipeModule } from '../swipe/swipe.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationPageRoutingModule,
    SwipeModule,
    SharedModule],
  declarations: [LocationPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LocationPageModule {}
