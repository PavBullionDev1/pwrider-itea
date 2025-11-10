import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalTaskPage } from './modal-task.page';

const routes: Routes = [
  {
    path: '',
    component: ModalTaskPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalTaskPageRoutingModule {}
