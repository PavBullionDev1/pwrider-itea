import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalWeightPage } from './modal-weight.page';

const routes: Routes = [
  {
    path: '',
    component: ModalWeightPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalWeightPageRoutingModule {}
