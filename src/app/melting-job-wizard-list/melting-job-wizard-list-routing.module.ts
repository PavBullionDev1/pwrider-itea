import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeltingJobWizardListPage } from './melting-job-wizard-list.page';

const routes: Routes = [
  {
    path: '',
    component: MeltingJobWizardListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeltingJobWizardListPageRoutingModule {}
