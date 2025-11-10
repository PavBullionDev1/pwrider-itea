import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BullionPendingCheckPage } from './bullion-pending-check.page';

const routes: Routes = [
  {
    path: '',
    component: BullionPendingCheckPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BullionPendingCheckPageRoutingModule {}
