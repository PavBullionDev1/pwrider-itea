import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RequestOrderPageRoutingModule } from './request-order-routing.module';
import { RequestOrderPage } from './request-order.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RequestOrderPageRoutingModule,
    SharedModule],
  declarations: [RequestOrderPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RequestOrderPageModule {}
