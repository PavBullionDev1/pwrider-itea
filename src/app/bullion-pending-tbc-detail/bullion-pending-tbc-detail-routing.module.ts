import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BullionPendingTBCDetailPage } from './bullion-pending-tbc-detail.page';

const routes: Routes = [
  {
    path: '',
    component: BullionPendingTBCDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BullionPendingTBCDetailPageRoutingModule {}
