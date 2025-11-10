import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BullionAddChangeRequestPageRoutingModule } from './bullion-add-change-request-routing.module';

import { BullionAddChangeRequestPage } from './bullion-add-change-request.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BullionAddChangeRequestPageRoutingModule,
    SharedModule],
  declarations: [BullionAddChangeRequestPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BullionAddChangeRequestPageModule {}