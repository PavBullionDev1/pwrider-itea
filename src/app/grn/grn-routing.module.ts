import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GrnPage } from './grn.page';

const routes: Routes = [
  {
    path: '',
    component: GrnPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GrnPageRoutingModule {}
