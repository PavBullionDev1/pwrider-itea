import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GoldShipmentClockInListPage } from './gold-shipment-clock-in-list.page';

const routes: Routes = [
  {
    path: '',
    component: GoldShipmentClockInListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GoldShipmentClockInListPageRoutingModule {}
