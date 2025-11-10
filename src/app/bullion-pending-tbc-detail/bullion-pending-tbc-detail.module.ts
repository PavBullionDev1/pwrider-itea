import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BullionPendingTBCDetailPageRoutingModule } from './bullion-pending-tbc-detail-routing.module';
import { BullionPendingTBCDetailPage } from './bullion-pending-tbc-detail.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BullionPendingTBCDetailPageRoutingModule,
    SharedModule],
  declarations: [BullionPendingTBCDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BullionPendingTbcDetailPageModule {}