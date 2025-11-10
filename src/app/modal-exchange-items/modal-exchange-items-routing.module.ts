import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalExchangeItemsPage } from './modal-exchange-items.page';

const routes: Routes = [
  {
    path: '',
    component: ModalExchangeItemsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalExchangeItemsPageRoutingModule {}
