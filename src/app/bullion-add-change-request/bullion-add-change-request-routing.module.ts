import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BullionAddChangeRequestPage } from './bullion-add-change-request.page';

const routes: Routes = [
  {
    path: '',
    component: BullionAddChangeRequestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BullionAddChangeRequestPageRoutingModule {}
