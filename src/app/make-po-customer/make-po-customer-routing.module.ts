import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MakePoCustomerPage } from './make-po-customer.page';

const routes: Routes = [
  {
    path: '',
    component: MakePoCustomerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MakePoCustomerPageRoutingModule {}
