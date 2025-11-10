import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VoucherDetailPageRoutingModule } from './voucher-detail-routing.module';

import { VoucherDetailPage } from './voucher-detail.page';
import { SwipeModule } from '../swipe/swipe.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VoucherDetailPageRoutingModule,
    SwipeModule,
    SharedModule
  ],
  declarations: [VoucherDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VoucherDetailPageModule {}
