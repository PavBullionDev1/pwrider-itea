import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryPageRoutingModule } from './delivery-routing.module';

import { DeliveryPage } from './delivery.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryPageRoutingModule,
    SharedModule],
  declarations: [DeliveryPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DeliveryPageModule {}
