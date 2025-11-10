import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BatchScanPage } from './batch-scan.page';

const routes: Routes = [
  {
    path: '',
    component: BatchScanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BatchScanRoutingModule {}
