import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalPunchingPage } from './modal-punching.page';

const routes: Routes = [
  {
    path: '',
    component: ModalPunchingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalPunchingPageRoutingModule {}
