import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalPendingReweightPage } from './modal-pending-reweight.page';

const routes: Routes = [
  {
    path: '',
    component: ModalPendingReweightPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalPendingReweightPageRoutingModule {}
