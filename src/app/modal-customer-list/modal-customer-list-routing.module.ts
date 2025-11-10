import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalCustomerListPage } from './modal-customer-list.page';

const routes: Routes = [
  {
    path: '',
    component: ModalCustomerListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalCustomerListPageRoutingModule {}
