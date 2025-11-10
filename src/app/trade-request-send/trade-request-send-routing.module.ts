import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TradeRequestSendPage } from './trade-request-send.page';

const routes: Routes = [
  {
    path: '',
    component: TradeRequestSendPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TradeRequestSendPageRoutingModule {}
