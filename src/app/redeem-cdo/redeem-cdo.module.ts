import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RedeemCdoPageRoutingModule } from './redeem-cdo-routing.module';

import { RedeemCdoPage } from './redeem-cdo.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RedeemCdoPageRoutingModule,
    SharedModule],
  declarations: [RedeemCdoPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RedeemCdoPageModule {}