import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickupOrderPageRoutingModule } from './pickup-order-routing.module';

import { PickupOrderPage } from './pickup-order.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickupOrderPageRoutingModule,
    SharedModule],
  declarations: [PickupOrderPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PickupOrderPageModule {}
