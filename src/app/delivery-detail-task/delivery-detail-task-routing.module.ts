import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryDetailTaskPage } from './delivery-detail-task.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryDetailTaskPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryDetailTaskRoutingModule {}
