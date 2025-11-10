import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QcPage } from './qc.page';

const routes: Routes = [
  {
    path: '',
    component: QcPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QcPageRoutingModule {}
