import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryDetailPage } from './delivery-detail.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryDetailPageRoutingModule {}
