import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryDetailPageRoutingModule } from './delivery-detail-routing.module';

import { DeliveryDetailPage } from './delivery-detail.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryDetailPageRoutingModule,
    SharedModule],
  declarations: [DeliveryDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DeliveryDetailPageModule {}
