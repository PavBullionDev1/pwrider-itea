import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssayReportClockInPage } from './assay-report-clock-in.page';

const routes: Routes = [
  {
    path: '',
    component: AssayReportClockInPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssayReportClockInPageRoutingModule {}
