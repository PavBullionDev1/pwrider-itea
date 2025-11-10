import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PunchingPage } from './punching.page';

const routes: Routes = [
  {
    path: '',
    component: PunchingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PunchingPageRoutingModule {}
