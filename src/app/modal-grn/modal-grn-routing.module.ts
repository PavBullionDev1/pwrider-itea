import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalGrnPage } from './modal-grn.page';

const routes: Routes = [
  {
    path: '',
    component: ModalGrnPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalGrnPageRoutingModule {}
