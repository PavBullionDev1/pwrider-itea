import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryPage } from './delivery.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryPageRoutingModule {}
