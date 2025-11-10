import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalSignaturePage } from './modal-signature.page';

const routes: Routes = [
  {
    path: '',
    component: ModalSignaturePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalSignaturePageRoutingModule {}
