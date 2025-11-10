import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryDetailTaskRoutingModule } from './delivery-detail-task-routing.module';

import { DeliveryDetailTaskPage } from './delivery-detail-task.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryDetailTaskRoutingModule,
    SharedModule],
  declarations: [DeliveryDetailTaskPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DeliveryDetailTaskModule {}
