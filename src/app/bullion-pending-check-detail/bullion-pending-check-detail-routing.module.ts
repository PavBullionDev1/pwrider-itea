import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BullionPendingCheckDetailPage } from './bullion-pending-check-detail.page';

const routes: Routes = [
  {
    path: '',
    component: BullionPendingCheckDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BullionPendingCheckDetailPageRoutingModule {}
