import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalAddChangeRequestPage } from './modal-add-change-request.page';

const routes: Routes = [
  {
    path: '',
    component: ModalAddChangeRequestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalAddChangeRequestPageRoutingModule {}
