import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PendingOrderPage } from './pending-order.page';

const routes: Routes = [
  {
    path: '',
    component: PendingOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingOrderPageRoutingModule {}
