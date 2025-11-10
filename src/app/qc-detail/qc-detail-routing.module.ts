import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QcDetailPage } from './qc-detail.page';

const routes: Routes = [
  {
    path: '',
    component: QcDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QcDetailPageRoutingModule {}
