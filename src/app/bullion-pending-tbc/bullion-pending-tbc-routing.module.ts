import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BullionPendingTBCPage } from './bullion-pending-tbc.page';

const routes: Routes = [
  {
    path: '',
    component: BullionPendingTBCPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BullionPendingTBCPageRoutingModule {}
