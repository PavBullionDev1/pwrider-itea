import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobLogPage } from './job-log.page';

const routes: Routes = [
  {
    path: '',
    component: JobLogPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobLogPageRoutingModule {}
