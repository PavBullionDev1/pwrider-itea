import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RedeemTaskPageRoutingModule } from './redeem-task-routing.module';

import { RedeemTaskPage } from './redeem-task.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RedeemTaskPageRoutingModule,
    SharedModule],
  declarations: [RedeemTaskPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RedeemTaskPageModule {}
