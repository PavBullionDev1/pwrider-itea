import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalQcPage } from './modal-qc.page';

const routes: Routes = [
  {
    path: '',
    component: ModalQcPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalQcPageRoutingModule {}
