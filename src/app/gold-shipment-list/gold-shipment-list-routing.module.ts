import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GoldShipmentListPage } from './gold-shipment-list.page';

const routes: Routes = [
  {
    path: '',
    component: GoldShipmentListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GoldShipmentListPageRoutingModule {}
