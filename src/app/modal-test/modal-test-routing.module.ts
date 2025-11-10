import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalTestPage } from './modal-test.page';

const routes: Routes = [
  {
    path: '',
    component: ModalTestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalTestPageRoutingModule {}
