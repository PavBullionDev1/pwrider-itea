import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BullionPendingTBCPageRoutingModule } from './bullion-pending-tbc-routing.module';
import { BullionPendingTBCPage } from './bullion-pending-tbc.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BullionPendingTBCPageRoutingModule,
    SharedModule],
  declarations: [BullionPendingTBCPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BullionPendingTBCPageModule {}
