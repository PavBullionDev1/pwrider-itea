import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WeightPage } from './weight.page';

const routes: Routes = [
  {
    path: '',
    component: WeightPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WeightPageRoutingModule {}
