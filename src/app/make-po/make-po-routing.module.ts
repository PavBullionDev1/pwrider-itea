import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MakePoPage } from './make-po.page';

const routes: Routes = [
  {
    path: '',
    component: MakePoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MakePoPageRoutingModule {}
