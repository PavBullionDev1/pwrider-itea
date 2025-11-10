import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LogoutPage } from './logout.page';

const routes: Routes = [
  {
    path: '',
    component: LogoutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogoutPageRoutingModule {}
