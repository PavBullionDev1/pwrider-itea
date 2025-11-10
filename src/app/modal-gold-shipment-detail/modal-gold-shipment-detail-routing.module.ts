import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalGoldShipmentDetailPage } from './modal-gold-shipment-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ModalGoldShipmentDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalGoldShipmentDetailRoutingModule {}
