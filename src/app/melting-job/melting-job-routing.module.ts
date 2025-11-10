import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeltingJobPage } from './melting-job.page';

const routes: Routes = [
  {
    path: '',
    component: MeltingJobPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeltingJobPageRoutingModule {}
