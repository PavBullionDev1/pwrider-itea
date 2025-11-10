import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryOrderPageRoutingModule } from './delivery-order-routing.module';

import { DeliveryOrderPage } from './delivery-order.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryOrderPageRoutingModule,
    SharedModule],
  declarations: [DeliveryOrderPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DeliveryOrderPageModule {}
