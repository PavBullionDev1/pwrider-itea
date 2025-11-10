import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalTaskDetailPage } from './modal-task-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ModalTaskDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalTaskDetailPageRoutingModule {}
