import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BullionPendingReweightPageRoutingModule } from './bullion-pending-reweight-routing.module';
import { BullionPendingReweightPage } from './bullion-pending-reweight.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BullionPendingReweightPageRoutingModule,
    SharedModule],
  declarations: [BullionPendingReweightPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BullionPendingReweightPageModule {}
