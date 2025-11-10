import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BullionPendingReweightDetailPageRoutingModule } from './bullion-pending-reweight-detail-routing.module';

import { BullionPendingReweightDetailPage } from './bullion-pending-reweight-detail.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BullionPendingReweightDetailPageRoutingModule,
    SharedModule],
  declarations: [BullionPendingReweightDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BullionPendingReweightDetailPageModule {}