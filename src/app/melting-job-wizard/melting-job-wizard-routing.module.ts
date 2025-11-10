import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeltingJobWizardPage } from './melting-job-wizard.page';

const routes: Routes = [
  {
    path: '',
    component: MeltingJobWizardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeltingJobWizardPageRoutingModule {}
