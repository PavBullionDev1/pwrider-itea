import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GoldShipmentPage } from './gold-shipment.page';

const routes: Routes = [
  {
    path: '',
    component: GoldShipmentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GoldShipmentPageRoutingModule {}
