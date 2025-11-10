import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GoldShipmentClockInPage } from './gold-shipment-clock-in.page';

const routes: Routes = [
  {
    path: '',
    component: GoldShipmentClockInPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GoldShipmentClockInPageRoutingModule {}
