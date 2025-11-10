import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryOrderPage } from './delivery-order.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryOrderPageRoutingModule {}
