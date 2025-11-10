import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RedeemTaskPage } from './redeem-task.page';

const routes: Routes = [
  {
    path: '',
    component: RedeemTaskPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RedeemTaskPageRoutingModule {}
