import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonalDashboardPage } from './personal-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: PersonalDashboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalDashboardPageRoutingModule {}
