import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PendingOrderPageRoutingModule } from './pending-order-routing.module';
import { PendingOrderPage } from './pending-order.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PendingOrderPageRoutingModule,
    SharedModule],
  declarations: [PendingOrderPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PendingOrderPageModule {}
