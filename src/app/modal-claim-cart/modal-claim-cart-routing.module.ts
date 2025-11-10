import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalClaimCartPage } from './modal-claim-cart.page';

const routes: Routes = [
  {
    path: '',
    component: ModalClaimCartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalClaimCartPageRoutingModule {}
