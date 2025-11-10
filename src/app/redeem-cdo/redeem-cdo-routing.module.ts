import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RedeemCdoPage } from './redeem-cdo.page';

const routes: Routes = [
  {
    path: '',
    component: RedeemCdoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RedeemCdoPageRoutingModule {}