import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WeightDetailPage } from './weight-detail.page';

const routes: Routes = [
  {
    path: '',
    component: WeightDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WeightDetailPageRoutingModule {}
