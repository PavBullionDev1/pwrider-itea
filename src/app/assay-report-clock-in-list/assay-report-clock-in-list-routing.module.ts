import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssayReportClockInListPage } from './assay-report-clock-in-list.page';

const routes: Routes = [
  {
    path: '',
    component: AssayReportClockInListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssayReportClockInListPageRoutingModule {}
