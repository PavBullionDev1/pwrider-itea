import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { PickupDetailTaskRoutingModule } from './pickup-detail-task-routing.module';

import { PickupDetailTaskPage } from './pickup-detail-task.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickupDetailTaskRoutingModule,
    SharedModule],
  declarations: [PickupDetailTaskPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PickupDetailTaskModule {}
