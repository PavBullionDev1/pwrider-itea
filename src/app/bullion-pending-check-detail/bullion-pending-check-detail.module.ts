import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BullionPendingCheckDetailPageRoutingModule } from './bullion-pending-check-detail-routing.module';

import { BullionPendingCheckDetailPage } from './bullion-pending-check-detail.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BullionPendingCheckDetailPageRoutingModule,
    SharedModule],
  declarations: [BullionPendingCheckDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BullionPendingCheckDetailPageModule {}