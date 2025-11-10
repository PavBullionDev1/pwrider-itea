import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ServicePageRoutingModule } from './service-routing.module';

import { ServicePage } from './service.page';
import { SwipeModule } from '../swipe/swipe.module';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServicePageRoutingModule,
    SwipeModule,
    SharedModule],
  declarations: [ServicePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ServicePageModule {}
