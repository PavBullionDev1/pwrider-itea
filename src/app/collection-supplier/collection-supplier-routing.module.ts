import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CollectionSupplierPage } from './collection-supplier.page';

const routes: Routes = [
  {
    path: '',
    component: CollectionSupplierPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CollectionSupplierPageRoutingModule {}
