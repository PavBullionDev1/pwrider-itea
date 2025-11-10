import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BullionPendingReweightDetailPage } from './bullion-pending-reweight-detail.page';

const routes: Routes = [
  {
    path: '',
    component: BullionPendingReweightDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BullionPendingReweightDetailPageRoutingModule {}
