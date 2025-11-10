import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CollectionOrderPage } from './collection-order.page';

const routes: Routes = [
  {
    path: '',
    component: CollectionOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CollectionOrderPageRoutingModule {}
