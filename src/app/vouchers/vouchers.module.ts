import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VouchersPageRoutingModule } from './vouchers-routing.module';

import { VouchersPage } from './vouchers.page';
import { InboxComponent } from '../../app/inbox/inbox.component';
import { SwipeModule } from '../swipe/swipe.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VouchersPageRoutingModule,
    SwipeModule,
    SharedModule
  ],
  declarations: [VouchersPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VouchersPageModule {}
