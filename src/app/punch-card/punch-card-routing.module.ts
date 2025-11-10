import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PunchCardPage } from './punch-card.page';

const routes: Routes = [
  {
    path: '',
    component: PunchCardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PunchCardPageRoutingModule {}
