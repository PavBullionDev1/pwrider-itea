import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BullionChangeRequestRoutingModule } from './bullion-change-request-routing.module';
import { BullionChangeRequestPage } from './bullion-change-request.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BullionChangeRequestRoutingModule,
    SharedModule],
  declarations: [BullionChangeRequestPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BullionChangeRequestPageModule {}