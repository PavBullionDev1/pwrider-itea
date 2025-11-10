import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CdoTasksPage } from './cdo-tasks.page';

const routes: Routes = [
  {
    path: '',
    component: CdoTasksPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CdoTasksPageRoutingModule {}